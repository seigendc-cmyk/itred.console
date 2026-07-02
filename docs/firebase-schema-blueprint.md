# SCI Firebase Schema Blueprint

This document defines the Firebase / Firestore structure for the SCI Control Centre before live Firebase integration.

## Core Principle

The SCI Control Centre is the licensing authority.

iTredPOS, iDeliver, Vendor Discovery, CashPlan, and future SCI modules are license consumers.

## Ownership Model

One Google account may own or manage multiple vendor companies.

Each company/vendor has its own:

- vendorId
- planId
- POS license
- app licenses
- branches
- terminals
- staff
- audit logs

Pricing belongs to the vendor/company, not to the Google email.

---

## Collections

### owner_accounts

Purpose:
Links a Google identity to one or many vendors.

Fields:
- id
- uid
- email
- displayName
- phone
- linkedVendorIds[]
- status
- createdAt
- updatedAt

---

### vendors

Purpose:
Stores vendor/company tenancy records.

Fields:
- id
- vendorId
- ownerUid
- ownerEmail
- businessName
- tradingName
- businessType
- country
- city
- physicalAddress
- contactPhone
- status
- planId
- licenseMode
- storageMode
- isDemoVendor
- createdAt
- updatedAt

---

### companies

Purpose:
Stores formal company profile details linked to a vendor.

Fields:
- id
- companyId
- vendorId
- companyName
- tradingName
- registrationNumber
- taxNumber
- country
- city
- status
- createdAt
- updatedAt

---

### branches

Purpose:
Stores vendor branch structures.

Fields:
- id
- branchId
- vendorId
- companyId
- branchName
- branchCode
- city
- address
- status
- createdAt
- updatedAt

---

### warehouses

Purpose:
Stores vendor warehouses.

Fields:
- id
- warehouseId
- vendorId
- branchId
- warehouseName
- warehouseCode
- status
- createdAt
- updatedAt

---

### staff

Purpose:
Stores staff access records.

Fields:
- id
- staffId
- vendorId
- branchId
- fullName
- email
- roleId
- status
- createdAt
- updatedAt

---

### pos_terminals

Purpose:
Stores POS terminal registrations.

Fields:
- id
- terminalId
- vendorId
- branchId
- terminalCode
- terminalName
- status
- createdAt
- updatedAt

---

### platform_plans

Purpose:
Stores SCI platform pricing plans.

Fields:
- id
- planId
- planName
- planCode
- description
- targetBusiness
- price
- currency
- billingCycle
- status
- licenseMode
- storageMode
- maxBusinesses
- maxBranches
- maxWarehouses
- maxTerminals
- maxStaff
- maxProducts
- maxCustomers
- includedApps[]
- createdAt
- updatedAt

---

### capacity_addons

Purpose:
Stores add-on capacity pricing.

Fields:
- id
- addonId
- addonName
- addonCode
- unitName
- pricePerUnit
- currency
- billingCycle
- status
- createdAt
- updatedAt

---

### business_modules

Purpose:
Stores optional SCI business modules.

Fields:
- id
- moduleId
- moduleName
- moduleCode
- description
- monthlyPrice
- currency
- status
- createdAt
- updatedAt

---

### pos_licenses

Purpose:
Stores POS license records consumed by iTredPOS.

Fields:
- id
- licenseId
- vendorId
- planId
- status
- licenseMode
- storageMode
- maxBranches
- maxWarehouses
- maxTerminals
- maxStaff
- maxProducts
- startsAt
- expiresAt
- issuedBy
- issuedAt
- notes
- createdAt
- updatedAt

---

### app_licenses

Purpose:
Stores licenses for other SCI applications.

Fields:
- id
- appLicenseId
- vendorId
- appCode
- status
- licenseMode
- storageMode
- startsAt
- expiresAt
- issuedBy
- createdAt
- updatedAt

---

### activation_requests

Purpose:
Stores new vendor registration and app activation requests.

Fields:
- id
- requestId
- ownerUid
- ownerEmail
- businessName
- tradingName
- businessType
- requestedApps[]
- status
- reviewedBy
- reviewedAt
- rejectionReason
- createdAt
- updatedAt

---

### rpn_agents

Purpose:
Stores RPN agents and assignments.

Fields:
- id
- rpnId
- fullName
- email
- phone
- region
- status
- assignedVendorIds[]
- createdAt
- updatedAt

---

### audit_logs

Purpose:
Stores console-level audit records.

Fields:
- id
- auditId
- actorId
- actorName
- action
- targetType
- targetId
- result
- message
- createdAt
- updatedAt

---

### license_events

Purpose:
Stores license lifecycle event history.

Fields:
- id
- eventId
- vendorId
- licenseId
- licenseType
- action
- previousStatus
- newStatus
- actorId
- actorName
- message
- createdAt

---

## Demo Mode Rule

Demo vendors must use:

- licenseMode: demo
- storageMode: localOnly
- isDemoVendor: true

Demo vendors must not be written to production Firebase.

Demo data remains in localStorage only.

---

## Production Rule

Production vendors must use:

- licenseMode: production
- storageMode: cloud
- isDemoVendor: false

Production license records are stored in Firestore.

---

## License Enforcement Rule

iTredPOS must never create production licenses.

iTredPOS only reads pos_licenses and enforces access.

The SCI Control Centre creates, renews, suspends, expires, or revokes licenses.

