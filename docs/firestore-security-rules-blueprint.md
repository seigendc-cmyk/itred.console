# SCI Firestore Security Rules Blueprint

This is the security blueprint before live Firebase integration.

## Core Security Principles

1. The SCI Control Centre is the licensing authority.
2. iTredPOS is a license consumer.
3. POS must never create production licenses.
4. Demo data must never write to production Firestore.
5. Every vendor document must be protected by vendorId.
6. Every admin action must be auditable.
7. Owner email alone is not enough for access.
8. Access must be based on uid, role, vendorId, and license status.

---

## Role Groups

### SCI Super Admin

Can:
- manage all vendors
- manage plans
- issue licenses
- suspend licenses
- revoke licenses
- approve activation requests
- read all audit logs

### SCI Admin

Can:
- review vendors
- approve activation requests
- issue standard licenses
- read operational logs

### RPN Agent

Can:
- view assigned vendors
- submit onboarding requests
- update onboarding notes

Cannot:
- issue production licenses
- change plans
- revoke licenses

### Vendor Owner

Can:
- read own vendor profile
- read own licenses
- read own plan
- manage own staff and branches if license allows

Cannot:
- issue own production license
- alter plan limits
- approve own activation

### POS Staff

Can:
- read allowed vendor access records
- read license status required for POS access

Cannot:
- write license records
- change vendor subscription
- access other vendors

---

## Required Custom Claims Later

Recommended Firebase Auth custom claims:

- sciRole
- vendorIds
- rpnId
- isSuperAdmin

Example:

{
  "sciRole": "super_admin",
  "isSuperAdmin": true,
  "vendorIds": []
}

Vendor owner example:

{
  "sciRole": "vendor_owner",
  "vendorIds": ["vendor_001", "vendor_002"]
}

---

## Collection Access Matrix

| Collection | Control Console | POS App | Vendor Owner | RPN |
|---|---|---|---|---|
| owner_accounts | admin read/write | no | own read | no |
| vendors | admin read/write | own read | own read | assigned read |
| companies | admin read/write | own read | own read/write limited | assigned read |
| branches | admin read/write | own read | own read/write limited | assigned read |
| warehouses | admin read/write | own read | own read/write limited | no |
| staff | admin read/write | own read | own read/write limited | no |
| pos_terminals | admin read/write | own read | own read/write limited | no |
| platform_plans | admin write | read | read | read |
| pos_licenses | admin write | own read only | own read only | no |
| app_licenses | admin write | own read only | own read only | no |
| activation_requests | admin read/write | no | create/read own | create assigned |
| audit_logs | admin read | no | limited own | limited own |
| license_events | admin read/write | own read | own read | no |

---

## Pseudo Rules

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isSuperAdmin() {
      return signedIn() &&
        request.auth.token.isSuperAdmin == true;
    }

    function isSCIAdmin() {
      return signedIn() &&
        (
          request.auth.token.sciRole == "super_admin" ||
          request.auth.token.sciRole == "sci_admin"
        );
    }

    function ownsVendor(vendorId) {
      return signedIn() &&
        vendorId in request.auth.token.vendorIds;
    }

    function isAssignedRPN(vendorId) {
      return signedIn() &&
        request.auth.token.sciRole == "rpn_agent" &&
        vendorId in request.auth.token.assignedVendorIds;
    }

    match /platform_plans/{planId} {
      allow read: if signedIn();
      allow write: if isSCIAdmin();
    }

    match /vendors/{vendorId} {
      allow read: if isSCIAdmin() || ownsVendor(vendorId) || isAssignedRPN(vendorId);
      allow create, update, delete: if isSCIAdmin();
    }

    match /pos_licenses/{licenseId} {
      allow read: if isSCIAdmin() || ownsVendor(resource.data.vendorId);
      allow create, update, delete: if isSCIAdmin();
    }

    match /app_licenses/{licenseId} {
      allow read: if isSCIAdmin() || ownsVendor(resource.data.vendorId);
      allow create, update, delete: if isSCIAdmin();
    }

    match /activation_requests/{requestId} {
      allow create: if signedIn();
      allow read: if isSCIAdmin() || request.auth.uid == resource.data.ownerUid;
      allow update, delete: if isSCIAdmin();
    }

    match /audit_logs/{auditId} {
      allow read: if isSCIAdmin();
      allow create: if isSCIAdmin();
      allow update, delete: if false;
    }

    match /license_events/{eventId} {
      allow read: if isSCIAdmin() || ownsVendor(resource.data.vendorId);
      allow create: if isSCIAdmin();
      allow update, delete: if false;
    }
  }
}

---

## Important Production Rule

Do not deploy these rules as final.

This document is the blueprint only.

Final rules must be tested with Firebase Emulator before production.

