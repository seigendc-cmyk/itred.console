import { POSLicense } from '../types/licensing';
import { Vendor, POSLicense as OldPOSLicense } from '../types';

export const licenseReaderService = {
  async getPOSLicense(vendorId: string): Promise<POSLicense | null> {
    const vendorsSaved = localStorage.getItem('sgn_vendors');
    const licensesSaved = localStorage.getItem('sgn_pos_licenses');
    
    if (!vendorsSaved || !licensesSaved) return null;
    
    const vendors: Vendor[] = JSON.parse(vendorsSaved);
    const licenses: OldPOSLicense[] = JSON.parse(licensesSaved);
    
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return null;
    
    // First check if there is an active production license created via the new writer service
    const prodLicensesSaved = localStorage.getItem('sgn_firestore_pos_licenses');
    if (prodLicensesSaved) {
      const prodLicenses: POSLicense[] = JSON.parse(prodLicensesSaved);
      const activeProd = prodLicenses.find(l => l.vendorId === vendorId && l.status === 'active');
      if (activeProd) return activeProd;
    }

    // Fallback to the initial pre-existing licenses list
    const lic = licenses.find(l => l.vendorName === vendor.name);
    if (!lic) return null;
    
    // Resolve plan limits based on vendor plan name
    let maxTerminals: number | 'Unlimited' = 1;
    let maxBranches: number | 'Unlimited' = 1;
    let maxStaff: number | 'Unlimited' = 3;
    let maxProducts: number | 'Unlimited' = 500;
    
    const planName = vendor.assignedPlanName || lic.planName || '';
    const planNameLower = planName.toLowerCase();
    
    if (planNameLower.includes('growth')) {
      maxTerminals = 5;
      maxBranches = 3;
      maxStaff = 15;
      maxProducts = 5000;
    } else if (planNameLower.includes('multi-branch')) {
      maxTerminals = 20;
      maxBranches = 10;
      maxStaff = 50;
      maxProducts = 25000;
    } else if (planNameLower.includes('enterprise')) {
      maxTerminals = 'Unlimited';
      maxBranches = 'Unlimited';
      maxStaff = 'Unlimited';
      maxProducts = 'Unlimited';
    } else if (planNameLower.includes('demo') || vendor.assignedPlanId === 'VENDOR_DEMO') {
      maxTerminals = 1;
      maxBranches = 1;
      maxStaff = 2;
      maxProducts = 50;
    }
    
    const isDemo = vendor.assignedPlanId === 'VENDOR_DEMO' || planNameLower.includes('demo');
    const licenseMode = isDemo ? 'demo' : 'production';
    const storageMode = isDemo ? 'localOnly' : 'cloud';
    
    let mappedStatus: 'pending' | 'active' | 'suspended' | 'expired' | 'revoked' = 'active';
    const statusLower = lic.status.toLowerCase();
    if (statusLower === 'active') mappedStatus = 'active';
    else if (statusLower === 'pending') mappedStatus = 'pending';
    else if (statusLower === 'suspended') mappedStatus = 'suspended';
    else if (statusLower === 'expired') mappedStatus = 'expired';
    else if (statusLower === 'deactivated' || statusLower === 'revoked') mappedStatus = 'revoked';

    if (mappedStatus === 'active' && lic.expiryDate && new Date(lic.expiryDate) < new Date()) {
      mappedStatus = 'expired';
    }
    
    return {
      licenseId: lic.id,
      vendorId: vendor.id,
      vendorName: vendor.name,
      planId: vendor.assignedPlanId || 'PLN-POS-STARTER',
      planName: planName,
      status: mappedStatus,
      licenseMode,
      storageMode,
      maxBranches,
      maxTerminals,
      maxStaff,
      maxProducts,
      startsAt: lic.issuedAt,
      expiresAt: lic.expiryDate || '2027-07-01',
      issuedBy: 'SYSTEM_AUTOGEN',
      issuedAt: lic.issuedAt,
      updatedAt: lic.issuedAt,
      notes: lic.notes
    };
  }
};
