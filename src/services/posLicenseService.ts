import { POSLicense, LicenseEvent } from '../types/licensing';
import { db } from '../lib/firebase';

export const posLicenseService = {
  // Helper to load license from local storage or Firestore mock
  async getLicenseById(licenseId: string): Promise<POSLicense | null> {
    const list = await db.getDocs('pos_licenses');
    const license = list.find((item: POSLicense) => item.licenseId === licenseId);
    if (license) return license;

    // Fallback to sgn_pos_licenses
    const saved = localStorage.getItem('sgn_pos_licenses');
    if (saved) {
      const oldList = JSON.parse(saved);
      const oldLic = oldList.find((l: any) => l.id === licenseId);
      if (oldLic) {
        // Map to POSLicense
        return {
          licenseId: oldLic.id,
          vendorId: `V-${oldLic.vendorName.substring(0, 3).toUpperCase()}`,
          vendorName: oldLic.vendorName,
          planId: 'PLN-POS-STARTER',
          planName: oldLic.planName || 'Starter POS',
          status: oldLic.status.toLowerCase() as any,
          licenseMode: oldLic.id.includes('DEMO') ? 'demo' : 'production',
          storageMode: oldLic.id.includes('DEMO') ? 'localOnly' : 'cloud',
          maxBranches: 1,
          maxTerminals: 1,
          maxStaff: 3,
          maxProducts: 50,
          startsAt: oldLic.issuedAt,
          expiresAt: oldLic.expiryDate || '2027-07-01',
          issuedBy: 'SYSTEM_AUTOGEN',
          issuedAt: oldLic.issuedAt,
          updatedAt: oldLic.issuedAt,
          notes: oldLic.notes
        };
      }
    }
    return null;
  },

  async issuePOSLicense(
    params: Omit<POSLicense, 'licenseId' | 'status' | 'issuedAt' | 'updatedAt'>,
    actor: string
  ): Promise<POSLicense> {
    const licenseId = `POS-LIC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    
    const newLicense: POSLicense = {
      ...params,
      licenseId,
      status: 'active',
      issuedAt: now,
      updatedAt: now
    };

    if (newLicense.licenseMode === 'production' && newLicense.storageMode === 'cloud') {
      await db.setDoc('pos_licenses', licenseId, newLicense);
      await this.writeLicenseEvent(licenseId, newLicense.vendorId, 'issue', actor, `Issued production license under plan ${newLicense.planName}`, 'production');
    } else {
      // Demo/local only: Save to local state
      const saved = localStorage.getItem('sgn_pos_licenses') || '[]';
      const list = JSON.parse(saved);
      list.push({
        id: licenseId,
        vendorName: newLicense.vendorName,
        terminalId: newLicense.terminalId,
        licenseKey: newLicense.licenseKey,
        status: 'Active',
        issuedAt: newLicense.issuedAt.split('T')[0],
        planName: newLicense.planName,
        expiryDate: newLicense.expiresAt,
        notes: newLicense.notes
      });
      localStorage.setItem('sgn_pos_licenses', JSON.stringify(list));
      
      // Save local demo event to local storage event audit log
      await this.writeLicenseEvent(licenseId, newLicense.vendorId, 'issue', actor, `Issued local sandbox demo license under plan ${newLicense.planName}`, 'demo');
    }

    return newLicense;
  },

  async renewPOSLicense(licenseId: string, nextExpiry: string, actor: string): Promise<void> {
    const license = await this.getLicenseById(licenseId);
    if (!license) return;

    const now = new Date().toISOString();
    const updatedFields = {
      status: 'active' as const,
      expiresAt: nextExpiry,
      updatedAt: now
    };

    if (license.licenseMode === 'production' && license.storageMode === 'cloud') {
      await db.updateDoc('pos_licenses', licenseId, updatedFields);
      await this.writeLicenseEvent(licenseId, license.vendorId, 'renew', actor, `Renewed production license. Next Expiry: ${nextExpiry}`, 'production');
    } else {
      // Demo: update sgn_pos_licenses
      const saved = localStorage.getItem('sgn_pos_licenses');
      if (saved) {
        const list = JSON.parse(saved);
        const index = list.findIndex((l: any) => l.id === licenseId);
        if (index !== -1) {
          list[index].status = 'Active';
          list[index].expiryDate = nextExpiry;
          list[index].notes = `${list[index].notes || ''}\n[Renewed on ${now.split('T')[0]} by ${actor}]`;
          localStorage.setItem('sgn_pos_licenses', JSON.stringify(list));
        }
      }
      await this.writeLicenseEvent(licenseId, license.vendorId, 'renew', actor, `Renewed local demo license. Next Expiry: ${nextExpiry}`, 'demo');
    }
  },

  async suspendPOSLicense(licenseId: string, actor: string): Promise<void> {
    const license = await this.getLicenseById(licenseId);
    if (!license) return;

    const now = new Date().toISOString();
    const updatedFields = {
      status: 'suspended' as const,
      updatedAt: now
    };

    if (license.licenseMode === 'production' && license.storageMode === 'cloud') {
      await db.updateDoc('pos_licenses', licenseId, updatedFields);
      await this.writeLicenseEvent(licenseId, license.vendorId, 'suspend', actor, `Suspended production license`, 'production');
    } else {
      // Demo: update sgn_pos_licenses
      const saved = localStorage.getItem('sgn_pos_licenses');
      if (saved) {
        const list = JSON.parse(saved);
        const index = list.findIndex((l: any) => l.id === licenseId);
        if (index !== -1) {
          list[index].status = 'Suspended';
          list[index].notes = `${list[index].notes || ''}\n[Suspended on ${now.split('T')[0]} by ${actor}]`;
          localStorage.setItem('sgn_pos_licenses', JSON.stringify(list));
        }
      }
      await this.writeLicenseEvent(licenseId, license.vendorId, 'suspend', actor, `Suspended local demo license`, 'demo');
    }
  },

  async revokePOSLicense(licenseId: string, actor: string): Promise<void> {
    const license = await this.getLicenseById(licenseId);
    if (!license) return;

    const now = new Date().toISOString();
    const updatedFields = {
      status: 'revoked' as const,
      updatedAt: now
    };

    if (license.licenseMode === 'production' && license.storageMode === 'cloud') {
      await db.updateDoc('pos_licenses', licenseId, updatedFields);
      await this.writeLicenseEvent(licenseId, license.vendorId, 'revoke', actor, `Revoked production license`, 'production');
    } else {
      // Demo: update sgn_pos_licenses
      const saved = localStorage.getItem('sgn_pos_licenses');
      if (saved) {
        const list = JSON.parse(saved);
        const index = list.findIndex((l: any) => l.id === licenseId);
        if (index !== -1) {
          list[index].status = 'Deactivated'; // Deactivated maps to revoked in legacy list
          list[index].notes = `${list[index].notes || ''}\n[Deactivated/Revoked on ${now.split('T')[0]} by ${actor}]`;
          localStorage.setItem('sgn_pos_licenses', JSON.stringify(list));
        }
      }
      await this.writeLicenseEvent(licenseId, license.vendorId, 'revoke', actor, `Revoked local demo license`, 'demo');
    }
  },

  async changePOSLicensePlan(
    licenseId: string,
    planId: string,
    planName: string,
    limits: {
      maxBranches: number | 'Unlimited';
      maxTerminals: number | 'Unlimited';
      maxStaff: number | 'Unlimited';
      maxProducts: number | 'Unlimited';
    },
    actor: string
  ): Promise<void> {
    const license = await this.getLicenseById(licenseId);
    if (!license) return;

    const now = new Date().toISOString();
    const updatedFields = {
      planId,
      planName,
      ...limits,
      updatedAt: now
    };

    if (license.licenseMode === 'production' && license.storageMode === 'cloud') {
      await db.updateDoc('pos_licenses', licenseId, updatedFields);
      await this.writeLicenseEvent(licenseId, license.vendorId, 'change_plan', actor, `Upgraded production license to plan ${planName}`, 'production');
    } else {
      // Demo: update sgn_pos_licenses
      const saved = localStorage.getItem('sgn_pos_licenses');
      if (saved) {
        const list = JSON.parse(saved);
        const index = list.findIndex((l: any) => l.id === licenseId);
        if (index !== -1) {
          list[index].planName = planName;
          list[index].notes = `${list[index].notes || ''}\n[Plan changed to ${planName} on ${now.split('T')[0]} by ${actor}]`;
          localStorage.setItem('sgn_pos_licenses', JSON.stringify(list));
        }
      }
      await this.writeLicenseEvent(licenseId, license.vendorId, 'change_plan', actor, `Upgraded local demo license to plan ${planName}`, 'demo');
    }
  },

  async getActivePOSLicenseForVendor(vendorId: string): Promise<POSLicense | null> {
    const list = await db.getDocs('pos_licenses');
    const license = list.find((item: POSLicense) => item.vendorId === vendorId && item.status === 'active');
    if (license) return license;

    // Fallback search
    const saved = localStorage.getItem('sgn_vendors');
    if (saved) {
      const vendors = JSON.parse(saved);
      const vendor = vendors.find((v: any) => v.id === vendorId);
      if (vendor) {
        const licensesSaved = localStorage.getItem('sgn_pos_licenses');
        if (licensesSaved) {
          const licenses = JSON.parse(licensesSaved);
          const lic = licenses.find((l: any) => l.vendorName === vendor.name);
          if (lic) {
            return {
              licenseId: lic.id,
              vendorId: vendor.id,
              vendorName: vendor.name,
              planId: vendor.assignedPlanId || 'PLN-POS-STARTER',
              planName: lic.planName || 'Starter POS',
              status: lic.status.toLowerCase() as any,
              licenseMode: lic.id.includes('DEMO') ? 'demo' : 'production',
              storageMode: lic.id.includes('DEMO') ? 'localOnly' : 'cloud',
              maxBranches: 1,
              maxTerminals: 1,
              maxStaff: 3,
              maxProducts: 50,
              startsAt: lic.issuedAt,
              expiresAt: lic.expiryDate || '2027-07-01',
              issuedBy: 'SYSTEM_AUTOGEN',
              issuedAt: lic.issuedAt,
              updatedAt: lic.issuedAt
            };
          }
        }
      }
    }
    return null;
  },

  async writeLicenseEvent(
    licenseId: string,
    vendorId: string,
    eventType: LicenseEvent['eventType'],
    actor: string,
    details: string,
    licenseMode: 'demo' | 'production'
  ): Promise<void> {
    const eventId = `EVT-${Math.floor(10000 + Math.random() * 90000)}`;
    const event: LicenseEvent = {
      eventId,
      licenseId,
      vendorId,
      eventType,
      eventTimestamp: new Date().toISOString(),
      actor,
      details
    };

    if (licenseMode === 'production') {
      await db.addDoc('license_events', event);
    } else {
      // Demo: write to local events list to avoid Firebase polluting
      const saved = localStorage.getItem('sgn_firestore_license_events_demo') || '[]';
      const events = JSON.parse(saved);
      events.push(event);
      localStorage.setItem('sgn_firestore_license_events_demo', JSON.stringify(events));
    }
  }
};
