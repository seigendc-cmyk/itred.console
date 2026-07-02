import React, { useState, useMemo, createContext, useContext } from 'react';
import { 
  HashRouter, 
  Routes, 
  Route, 
  Navigate, 
  Outlet, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';

import Sidebar, { SidebarTab } from './components/Sidebar';
import Toolbar from './components/Toolbar';
import DashboardView from './components/DashboardView';
import VendorManagementView from './components/VendorManagementView';
import PlansPricingView from './components/PlansPricingView';
import POSLicensingView from './components/POSLicensingView';
import AppLicensingView from './components/AppLicensingView';
import ActivationRequestsView from './components/ActivationRequestsView';
import RPNManagementView from './components/RPNManagementView';
import FinanceView from './components/FinanceView';
import EcosystemDashboardView from './components/EcosystemDashboardView';
import AIAnalystView from './components/AIAnalystView';
import SCIDiagnosticsView from './components/SCIDiagnosticsView';
import ErrorBoundary from './components/ErrorBoundary';
import POSLicenseGuard from './guards/POSLicenseGuard';
import {
  NotificationsView,
  AuditLogsView,
  SystemSettingsView,
  IntegrationsView
} from './components/SecondaryViews';

import {
  MOCK_COMPANIES,
  MOCK_ADMINS,
  INITIAL_VENDORS,
  INITIAL_PLANS,
  INITIAL_POS_LICENSES,
  INITIAL_APP_LICENSES,
  INITIAL_ACTIVATION_REQUESTS,
  INITIAL_RPN_AGENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FINANCE_RECORDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SYSTEM_CONFIG,
  INITIAL_INTEGRATIONS
} from './data';

import {
  Vendor,
  Plan,
  POSLicense,
  AppLicense,
  ActivationRequest,
  RPNAgent,
  AuditLog,
  FinanceRecord,
  AppNotification,
  SystemConfig,
  IntegrationService
} from './types';

import {
  CreateVendorWizard,
  PendingVerificationWizard,
  AdminApprovalWizard,
  AssignPlanWizard,
  IssuePOSLicenseWizard,
  ActivateAppsWizard,
  VendorReadyWizard
} from './components/LifecycleWizard';

import {
  GoogleLoginView,
  CompanySelectorView,
  StaffAccessView
} from './components/LoginJourney';

import SimulatorControls from './components/SimulatorControls';

/* ==========================================================================
   LIFECYCLE CONTEXT DECLARATION
   ========================================================================== */
const LifecycleContext = createContext<any>(null);

export function useLifecycle() {
  return useContext(LifecycleContext);
}

export default function App() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <LifecycleProvider>
          <Routes>
            {/* Public Authentication routes */}
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/company-selector" element={<CompanyRoute />} />
            <Route path="/staff-access" element={<StaffRoute />} />

            {/* Secure/Protected Console routes */}
            <Route element={<RequireAuthLayout />}>
              <Route path="/dashboard" element={<DashboardRoute />} />
              <Route path="/vendors" element={<VendorsRoute />} />
              <Route path="/plans" element={<PlansRoute />} />
              <Route path="/pos" element={<POSRoute />} />
              <Route path="/apps" element={<AppsRoute />} />
              <Route path="/activations" element={<ActivationsRoute />} />
              <Route path="/rpn" element={<RPNRoute />} />
              <Route path="/finance" element={<FinanceRoute />} />
              <Route path="/notifications" element={<NotificationsRoute />} />
              <Route path="/audit" element={<AuditRoute />} />
              <Route path="/settings" element={<SettingsRoute />} />
              <Route path="/integrations" element={<IntegrationsRoute />} />
              <Route path="/ecosystem" element={<EcosystemRoute />} />
              <Route path="/ai_analyst" element={<AIAnalystRoute />} />
              <Route path="/diagnostics" element={<DiagnosticsRoute />} />

              {/* Special Guided Vendor Lifecycle Routes */}
              <Route path="/lifecycle/create-vendor" element={<CreateVendorRoute />} />
              <Route path="/lifecycle/pending-verification/:vendorId" element={<PendingVerificationRoute />} />
              <Route path="/lifecycle/admin-approval/:vendorId" element={<AdminApprovalRoute />} />
              <Route path="/lifecycle/assign-plan/:vendorId" element={<AssignPlanRoute />} />
              <Route path="/lifecycle/issue-pos-license/:vendorId" element={<IssuePOSLicenseRoute />} />
              <Route path="/lifecycle/activate-apps/:vendorId" element={<ActivateAppsRoute />} />
              <Route path="/lifecycle/vendor-ready/:vendorId" element={<VendorReadyRoute />} />
            </Route>

            {/* General Catch-all Fallbacks */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </LifecycleProvider>
      </ErrorBoundary>
    </HashRouter>
  );
}

/* ==========================================================================
   LIFECYCLE STATE & PROVIDER ENGINE
   ========================================================================== */
function LifecycleProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  // Authentication & Onboarding state
  const [isGoogleLoggedIn, setIsGoogleLoggedIn] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(() => {
    return localStorage.getItem('sgn_google_email') || 'seigendc@gmail.com';
  });
  const [currentCompany, setCurrentCompany] = useState(MOCK_COMPANIES[0]);
  const [currentAdmin, setCurrentAdmin] = useState(MOCK_ADMINS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Demo Mode states
  const [isDemoActive, setIsDemoActive] = useState<boolean>(() => {
    return localStorage.getItem('sci_demo_mode') === 'true';
  });

  const [demoVendor, setDemoVendor] = useState<Vendor | null>(() => {
    const saved = localStorage.getItem('sci_demo_vendor');
    return saved ? JSON.parse(saved) : null;
  });

  // Core Entity Database Lists
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('sgn_vendors');
    let loadedVendors = saved ? JSON.parse(saved) : INITIAL_VENDORS;
    const isDemo = localStorage.getItem('sci_demo_mode') === 'true';
    if (isDemo) {
      const savedDemoVendor = localStorage.getItem('sci_demo_vendor');
      if (savedDemoVendor) {
        const parsedDemo = JSON.parse(savedDemoVendor);
        if (!loadedVendors.some((v: any) => v.id === parsedDemo.id)) {
          loadedVendors = [parsedDemo, ...loadedVendors];
        }
      }
    }
    return loadedVendors;
  });
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [posLicenses, setPosLicenses] = useState<POSLicense[]>(() => {
    const saved = localStorage.getItem('sgn_pos_licenses');
    let loadedLicenses = saved ? JSON.parse(saved) : INITIAL_POS_LICENSES;
    const isDemo = localStorage.getItem('sci_demo_mode') === 'true';
    if (isDemo) {
      const demoLicId = 'DEMO-LIC-9999';
      if (!loadedLicenses.some((l: any) => l.id === demoLicId)) {
        const newDemoLicense: POSLicense = {
          id: demoLicId,
          vendorName: 'Alpha Demo Store',
          terminalId: 'TRM-DEMO-001',
          licenseKey: 'ITRD-POS-DEMO-9999-ABCD',
          status: 'Active',
          issuedAt: new Date().toISOString().split('T')[0],
          planName: 'Vendor Demo',
          expiryDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
          notes: 'Local Demo Bounded Terminal Sandbox',
          billingCycle: 'Monthly',
          tokenPrice: 0,
          collectionTag: 'Demo Sandbox'
        };
        loadedLicenses = [newDemoLicense, ...loadedLicenses];
      }
    }
    return loadedLicenses;
  });
  const [appLicenses, setAppLicenses] = useState<AppLicense[]>(() => {
    const saved = localStorage.getItem('sgn_app_licenses');
    return saved ? JSON.parse(saved) : INITIAL_APP_LICENSES;
  });
  const [activationRequests, setActivationRequests] = useState<ActivationRequest[]>(() => {
    const saved = localStorage.getItem('sgn_activation_requests');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVATION_REQUESTS;
  });
  const [rpnAgents, setRpnAgents] = useState<RPNAgent[]>(INITIAL_RPN_AGENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('sgn_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(() => {
    const saved = localStorage.getItem('sgn_finance_records');
    return saved ? JSON.parse(saved) : INITIAL_FINANCE_RECORDS;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('sgn_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_SYSTEM_CONFIG);
  const [integrations, setIntegrations] = useState<IntegrationService[]>(INITIAL_INTEGRATIONS);

  // Automatically toggle demo mode when demo vendor is active
  React.useEffect(() => {
    if (currentCompany === 'Alpha Demo Store') {
      setIsDemoActive(true);
      localStorage.setItem('sci_demo_mode', 'true');
    } else {
      setIsDemoActive(false);
      localStorage.setItem('sci_demo_mode', 'false');
    }
  }, [currentCompany]);

  // Sync to local storage
  React.useEffect(() => {
    localStorage.setItem('sgn_vendors', JSON.stringify(vendors));
  }, [vendors]);

  React.useEffect(() => {
    localStorage.setItem('sgn_pos_licenses', JSON.stringify(posLicenses));
  }, [posLicenses]);

  React.useEffect(() => {
    localStorage.setItem('sgn_app_licenses', JSON.stringify(appLicenses));
  }, [appLicenses]);

  React.useEffect(() => {
    localStorage.setItem('sgn_activation_requests', JSON.stringify(activationRequests));
  }, [activationRequests]);

  React.useEffect(() => {
    localStorage.setItem('sgn_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  React.useEffect(() => {
    localStorage.setItem('sgn_finance_records', JSON.stringify(financeRecords));
  }, [financeRecords]);

  React.useEffect(() => {
    localStorage.setItem('sgn_notifications', JSON.stringify(notifications));
  }, [notifications]);

  React.useEffect(() => {
    localStorage.setItem('sgn_google_email', googleEmail);
  }, [googleEmail]);

  // Subview specific state
  const [selectedAuditActor, setSelectedAuditActor] = useState<string>('all');

  // Helper action: Prepend dynamic system log and notification packet
  const addLogAndNotify = (
    actor: string,
    action: string,
    target: string,
    status: AuditLog['status'] = 'Success',
    notifType: AppNotification['type'] = 'info',
    notifTitle: string,
    notifMessage: string
  ) => {
    const newLogId = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLog: AuditLog = {
      id: newLogId,
      timestamp: new Date().toISOString(),
      actor,
      action,
      target,
      status
    };
    setAuditLogs(prev => [newLog, ...prev]);

    const newNotifId = `NTF-${Math.floor(100 + Math.random() * 900)}`;
    const newNotif: AppNotification = {
      id: newNotifId,
      timestamp: new Date().toISOString(),
      title: notifTitle,
      message: notifMessage,
      type: notifType,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Demo Environment Actions
  const startVendorDemo = () => {
    const now = new Date();
    const expires = new Date();
    expires.setDate(now.getDate() + 7);
    
    // Set local storage keys
    localStorage.setItem('sci_demo_mode', 'true');
    localStorage.setItem('sci_demo_started_at', now.toISOString());
    localStorage.setItem('sci_demo_expires_at', expires.toISOString());
    
    const newDemoVendor: Vendor = {
      id: 'V-DEMO-99',
      name: 'Alpha Demo Store',
      tradingName: 'Alpha Demo Operations',
      category: 'Convenience Stores',
      status: 'Active',
      email: 'demo@sci-local.internal',
      code: 'DEMO-99',
      joinedDate: now.toISOString().split('T')[0],
      location: 'Local Storage Sandbox',
      assignedPlanId: 'VENDOR_DEMO',
      assignedPlanName: 'Vendor Demo',
      licenseKey: 'DEMO-LICENSE-KEY-9999'
    };
    
    localStorage.setItem('sci_demo_vendor', JSON.stringify(newDemoVendor));
    
    // Set state
    setIsDemoActive(true);
    setDemoVendor(newDemoVendor);
    
    setVendors(prev => {
      if (prev.some(v => v.id === 'V-DEMO-99')) return prev;
      return [newDemoVendor, ...prev];
    });

    const newDemoLicense: POSLicense = {
      id: 'DEMO-LIC-9999',
      vendorName: 'Alpha Demo Store',
      terminalId: 'TRM-DEMO-001',
      licenseKey: 'ITRD-POS-DEMO-9999-ABCD',
      status: 'Active',
      issuedAt: now.toISOString().split('T')[0],
      planName: 'Vendor Demo',
      expiryDate: expires.toISOString().split('T')[0],
      notes: 'Local Demo Bounded Terminal Sandbox',
      billingCycle: 'Monthly',
      tokenPrice: 0,
      collectionTag: 'Demo Sandbox'
    };
    setPosLicenses(prev => {
      if (prev.some(l => l.id === 'DEMO-LIC-9999')) return prev;
      return [newDemoLicense, ...prev];
    });
    
    // Add mock demo data to sci_demo_data
    const mockDemoData = {
      productsCount: 15,
      customersCount: 8,
      salesCount: 12,
      purchasesCount: 4,
      staffCount: 2
    };
    localStorage.setItem('sci_demo_data', JSON.stringify(mockDemoData));

    // Audit log and Notification
    addLogAndNotify(
      'SYSTEM_DAEMON',
      'ACTIVATE_DEMO_MODE',
      'Local Sandbox environment initialized',
      'Success',
      'success',
      'Demo Mode Activated',
      'Sales demo plan started. Storage redirected to local storage sandbox only. Firebase writes disabled.'
    );
  };

  const resetDemoData = () => {
    // Clear demo localStorage keys
    localStorage.removeItem('sci_demo_mode');
    localStorage.removeItem('sci_demo_vendor');
    localStorage.removeItem('sci_demo_data');
    localStorage.removeItem('sci_demo_started_at');
    localStorage.removeItem('sci_demo_expires_at');
    
    // Reset state
    setIsDemoActive(false);
    setDemoVendor(null);
    
    // Remove the demo vendor from vendors list
    setVendors(prev => prev.filter(v => v.id !== 'V-DEMO-99'));
    // Remove demo license from licenses list
    setPosLicenses(prev => prev.filter(l => l.id !== 'DEMO-LIC-9999'));

    addLogAndNotify(
      'SYSTEM_DAEMON',
      'RESET_DEMO_MODE',
      'Local Sandbox environment cleared',
      'Success',
      'info',
      'Demo Mode Reset',
      'Local demo data cleared from this device. Storage settings restored.'
    );
  };

  const convertDemoToPaidPlan = () => {
    navigate('/plans');
    setTimeout(() => {
      const el = document.getElementById('section_licensing_simulator');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // State modifiers
  const handleCreateVendor = (newVendorData: Omit<Vendor, 'id' | 'code' | 'joinedDate'>) => {
    const nextNum = vendors.length + 101;
    const newId = `V-${nextNum}`;
    const newCode = `${newVendorData.name.substring(0, 3).toUpperCase()}-${nextNum}`;
    
    const newVendor: Vendor = {
      ...newVendorData,
      id: newId,
      code: newCode,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setVendors(prev => [newVendor, ...prev]);

    if (newVendor.linkedRpnId) {
      setRpnAgents(prev => prev.map(agent => {
        if (agent.id === newVendor.linkedRpnId) {
          const currentLinked = agent.linkedVendorIds || [];
          return {
            ...agent,
            linkedVendorIds: [...currentLinked, newId]
          };
        }
        return agent;
      }));
    }

    // Prepend a pending activation request for compliance stream
    const newActId = `ACT-${Math.floor(900 + Math.random() * 100)}`;
    const newActRequest: ActivationRequest = {
      id: newActId,
      vendorName: newVendor.name,
      requestedItem: 'Merchant Verification Protocol',
      type: 'Vendor Verification',
      date: newVendor.joinedDate,
      status: 'Pending'
    };
    setActivationRequests(prev => [newActRequest, ...prev]);

    addLogAndNotify(
      currentAdmin.name,
      'REGISTER_VENDOR_PENDING',
      `${newVendor.name} (${newId})`,
      'Success',
      'info',
      'New Vendor Application',
      `${newVendor.name} has registered and submitted credentials for verification.`
    );
  };

  const handleApproveVendor = (vendorId: string) => {
    setVendors(prev =>
      prev.map(v => (v.id === vendorId ? { ...v, status: 'Active' } : v))
    );

    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setActivationRequests(prev =>
        prev.map(r => (r.vendorName === vendor.name && r.type === 'Vendor Verification' ? { ...r, status: 'Approved' } : r))
      );

      // Record deposit to Finance ledger indices
      const newTxn: FinanceRecord = {
        id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
        description: `${vendor.name} - security verification deposit`,
        amount: 500.00,
        type: 'Credit',
        date: new Date().toISOString().split('T')[0],
        refNo: `REF-SGN-${Math.floor(10000 + Math.random() * 90000)}`
      };
      setFinanceRecords(prev => [newTxn, ...prev]);

      addLogAndNotify(
        currentAdmin.name,
        'APPROVE_VENDOR_VERIFICATION',
        `${vendor.name} (${vendorId})`,
        'Success',
        'success',
        'Merchant Verified',
        `${vendor.name} compliance audit passed. Security clearance and ledger sync initialized.`
      );
    }
  };

  const handleUpdateVendorStatus = (vendorId: string, status: Vendor['status']) => {
    setVendors(prev =>
      prev.map(v => (v.id === vendorId ? { ...v, status } : v))
    );

    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      addLogAndNotify(
        currentAdmin.name,
        `VENDOR_STATUS_${status.toUpperCase()}`,
        `${vendor.name} (${vendorId})`,
        'Success',
        status === 'Active' ? 'success' : 'warning',
        `Vendor Status Updated`,
        `${vendor.name} connection status modified to ${status.toUpperCase()}.`
      );
    }
  };

  const handleDeleteVendor = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    setVendors(prev => prev.filter(v => v.id !== vendorId));
    if (vendor) {
      addLogAndNotify(
        currentAdmin.name,
        'DEREGISTER_VENDOR',
        `${vendor.name} (${vendorId})`,
        'Warning',
        'alert',
        'Vendor Record De-registered',
        `Ecosystem records for ${vendor.name} have been completely expunged.`
      );
    }
  };

  const handleIssuePOSLicense = (vendorName: string, terminalId: string, licenseKey: string) => {
    const newId = `POS-LIC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLicense: POSLicense = {
      id: newId,
      vendorName,
      terminalId,
      licenseKey,
      status: 'Active',
      issuedAt: new Date().toISOString().split('T')[0]
    };

    setPosLicenses(prev => [newLicense, ...prev]);

    setPlans(prev =>
      prev.map(p => (p.type === 'POS' ? { ...p, activeVendors: p.activeVendors + 1 } : p))
    );

    const newTxn: FinanceRecord = {
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      description: `${vendorName} - Terminal license registration fee`,
      amount: 850.00,
      type: 'Credit',
      date: new Date().toISOString().split('T')[0],
      refNo: `REF-SGN-${Math.floor(10000 + Math.random() * 90000)}`
    };
    setFinanceRecords(prev => [newTxn, ...prev]);

    addLogAndNotify(
      currentAdmin.name,
      'ISSUE_POS_LICENSE',
      `${vendorName} • ${terminalId}`,
      'Success',
      'success',
      'POS Terminal License Issued',
      `Terminal ${terminalId} binds key ${licenseKey.substring(0, 13)}...`
    );
  };

  const handleRevokePOSLicense = (licenseId: string) => {
    setPosLicenses(prev =>
      prev.map(lic => (lic.id === licenseId ? { ...lic, status: 'Expired' } : lic))
    );

    const lic = posLicenses.find(l => l.id === licenseId);
    if (lic) {
      addLogAndNotify(
        currentAdmin.name,
        'REVOKE_POS_LICENSE',
        `${lic.vendorName} • ${lic.terminalId}`,
        'Warning',
        'alert',
        'POS License Suspended',
        `Access credentials for Terminal ${lic.terminalId} have been flagged EXPIRED.`
      );
    }
  };

  const handleRenewPOSLicense = (licenseId: string) => {
    setPosLicenses(prev =>
      prev.map(lic => (lic.id === licenseId ? { ...lic, status: 'Active' } : lic))
    );

    const lic = posLicenses.find(l => l.id === licenseId);
    if (lic) {
      addLogAndNotify(
        currentAdmin.name,
        'RENEW_POS_LICENSE',
        `${lic.vendorName} • ${lic.terminalId}`,
        'Success',
        'success',
        'POS License Renewed',
        `Terminal ${lic.terminalId} successfully restored to active clearance.`
      );
    }
  };

  const handleActivateAppLicense = (vendorName: string, appName: string, key: string) => {
    const newId = `APP-LIC-${Math.floor(100 + Math.random() * 900)}`;
    const newLicense: AppLicense = {
      id: newId,
      appName,
      vendorName,
      key,
      status: 'Active'
    };

    setAppLicenses(prev => [newLicense, ...prev]);

    setPlans(prev =>
      prev.map(p => (p.type === 'App' ? { ...p, activeVendors: p.activeVendors + 1 } : p))
    );

    const newTxn: FinanceRecord = {
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      description: `${vendorName} - ${appName} integration fee`,
      amount: 1200.00,
      type: 'Credit',
      date: new Date().toISOString().split('T')[0],
      refNo: `REF-SGN-${Math.floor(10000 + Math.random() * 90000)}`
    };
    setFinanceRecords(prev => [newTxn, ...prev]);

    addLogAndNotify(
      currentAdmin.name,
      'PROVISION_APP_INTEGRATION',
      `${vendorName} • ${appName}`,
      'Success',
      'success',
      'Plugin Interface Provisioned',
      `App ${appName} activated with token keys successfully.`
    );
  };

  const handleToggleAppStatus = (licenseId: string) => {
    setAppLicenses(prev =>
      prev.map(app => {
        if (app.id === licenseId) {
          const nextStatus = app.status === 'Active' ? 'Suspended' : 'Active';
          return { ...app, status: nextStatus };
        }
        return app;
      })
    );

    const app = appLicenses.find(a => a.id === licenseId);
    if (app) {
      const isSus = app.status === 'Active';
      addLogAndNotify(
        currentAdmin.name,
        isSus ? 'SUSPEND_APP_GATEWAY' : 'RESTORE_APP_GATEWAY',
        `${app.vendorName} • ${app.appName}`,
        isSus ? 'Warning' : 'Success',
        isSus ? 'warning' : 'success',
        `App Access Modified`,
        `Integration token for ${app.appName} changed to ${isSus ? 'SUSPENDED' : 'ACTIVE'}.`
      );
    }
  };

  const handleApproveRequest = (requestId: string) => {
    const req = activationRequests.find(r => r.id === requestId);
    if (!req) return;

    setActivationRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'Approved' } : r))
    );

    if (req.type === 'Vendor Verification') {
      const targetVendor = vendors.find(v => v.name === req.vendorName);
      if (targetVendor) {
        handleApproveVendor(targetVendor.id);
      }
    } else if (req.type === 'POS License') {
      const randTermNum = Math.floor(100 + Math.random() * 900);
      const randKey = `ITRD-POS-F890-FF5C-${Math.floor(1000 + Math.random() * 9000)}`;
      handleIssuePOSLicense(req.vendorName, `TRM-GEN-${randTermNum}`, randKey);
    } else if (req.type === 'App Integration') {
      const appName = req.requestedItem.split(' App ')[0] || 'Dynamic Custom Plugin';
      const randToken = `SGN-APP-${Math.floor(1000 + Math.random() * 9000)}`;
      handleActivateAppLicense(req.vendorName, appName, randToken);
    }

    addLogAndNotify(
      currentAdmin.name,
      'APPROVE_ACTIVATION_SIGNAL',
      `ACT-REQ (${requestId})`,
      'Success',
      'success',
      'Activation Signal Processed',
      `Signal ${requestId} approved. Linked micro-resources provisioned.`
    );
  };

  const handleRejectRequest = (requestId: string) => {
    setActivationRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'Rejected' } : r))
    );

    addLogAndNotify(
      currentAdmin.name,
      'REJECT_ACTIVATION_SIGNAL',
      `ACT-REQ (${requestId})`,
      'Warning',
      'alert',
      'Activation Signal Rejected',
      `Signal ${requestId} declined and discarded from gateway index.`
    );
  };

  const handlePingNode = (nodeId: string) => {
    const agent = rpnAgents.find(r => r.id === nodeId);
    if (!agent) return;

    const randMs = Math.floor(15 + Math.random() * 60);
    const rates = ['390.1 Tx/s', '412.0 Tx/s', '502.5 Tx/s', '610.2 Tx/s', '124.0 Tx/s'];
    const selectedRate = rates[Math.floor(Math.random() * rates.length)];

    setRpnAgents(prev =>
      prev.map(r => {
        if (r.id === nodeId) {
          return {
            ...r,
            connectionStatus: r.connectionStatus === 'Offline' ? 'Connected' : r.connectionStatus,
            throughput: r.connectionStatus === 'Offline' ? '12.0 Tx/s' : selectedRate,
            activeSessions: r.activeSessions === 0 ? 110 : r.activeSessions + Math.floor(Math.random() * 10 - 5)
          };
        }
        return r;
      })
    );

    addLogAndNotify(
      'SYSTEM_DAEMON',
      'PING_NODE_DIAGNOSTIC',
      `${agent.name} (${nodeId})`,
      'Success',
      'success',
      'RPN Node Diagnostic Clear',
      `${agent.name} ping return successful. Latency: ${randMs}ms. Routing synchronized.`
    );
  };

  const handleToggleIntegrationService = (serviceId: string) => {
    setIntegrations(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          const nextStatus = srv.status === 'Connected' ? 'Disconnected' : 'Connected';
          return {
            ...srv,
            status: nextStatus,
            lastSync: nextStatus === 'Connected' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : srv.lastSync
          };
        }
        return srv;
      })
    );

    const srv = integrations.find(s => s.id === serviceId);
    if (srv) {
      const isCut = srv.status === 'Connected';
      addLogAndNotify(
        currentAdmin.name,
        isCut ? 'SEVER_INTEGRATION_CHANNEL' : 'BIND_INTEGRATION_CHANNEL',
        `${srv.name} (${serviceId})`,
        isCut ? 'Warning' : 'Success',
        isCut ? 'warning' : 'success',
        `Integration Synchronisation Modified`,
        `Outbound gateway route for ${srv.name} has been ${isCut ? 'DISCONNECTED' : 'RESTORED'}.`
      );
    }
  };

  const handleSaveSystemConfig = (updatedConfig: SystemConfig) => {
    setSystemConfig(updatedConfig);
    addLogAndNotify(
      currentAdmin.name,
      'COMMIT_SYSTEM_CONFIG',
      `Gateway Bind: ${updatedConfig.gatewayIp}`,
      'Success',
      'success',
      'Daemon Constants Updated',
      `Gateway constants written. Port 3000 mapping reloaded for IP ${updatedConfig.gatewayIp}.`
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addLogAndNotify(
      currentAdmin.name,
      'ACKNOWLEDGE_ALL_ALERTS',
      'Notifications Buffer',
      'Success',
      'success',
      'Alerts Acknowledged',
      'All active notification packets marked READ.'
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    addLogAndNotify(
      currentAdmin.name,
      'FLUSH_NOTIFICATIONS_BUFFER',
      'Notifications Buffer',
      'Warning',
      'warning',
      'Buffer Flushed',
      'System alerts log buffer cleared.'
    );
  };

  const handleToggleRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: !n.read } : n))
    );
  };

  // Reset entire simulator state
  const handleResetState = () => {
    setIsGoogleLoggedIn(false);
    setGoogleEmail('seigendc@gmail.com');
    setCurrentCompany(MOCK_COMPANIES[0]);
    setCurrentAdmin(MOCK_ADMINS[0]);
    setVendors(INITIAL_VENDORS);
    setPlans(INITIAL_PLANS);
    setPosLicenses(INITIAL_POS_LICENSES);
    setAppLicenses(INITIAL_APP_LICENSES);
    setActivationRequests(INITIAL_ACTIVATION_REQUESTS);
    setRpnAgents(INITIAL_RPN_AGENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setFinanceRecords(INITIAL_FINANCE_RECORDS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSystemConfig(INITIAL_SYSTEM_CONFIG);
    setIntegrations(INITIAL_INTEGRATIONS);
    localStorage.clear();
  };

  // Dynamically calculate metrics
  const computedStats = useMemo(() => {
    const productionVendors = vendors.filter(v => v.assignedPlanId !== 'VENDOR_DEMO');
    const totalVendorsCount = productionVendors.length;
    const pendingActivationsCount = activationRequests.filter(r => r.status === 'Pending').length;
    const productionLicenses = posLicenses.filter(lic => lic.planName !== 'Vendor Demo' && !lic.id.startsWith('DEMO-'));
    const activePOSCount = productionLicenses.filter(lic => lic.status === 'Active').length;
    
    const totalCreditsSum = financeRecords
      .filter(rec => rec.type === 'Credit')
      .reduce((sum, rec) => sum + rec.amount, 0);
    const revenueThisMonthStr = `$${totalCreditsSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const onlineRPNAgentsCount = rpnAgents.filter(agent => agent.connectionStatus === 'Connected').length;
    const pendingVerificationsCount = productionVendors.filter(v => v.status === 'Pending Verification').length;

    return {
      totalVendors: totalVendorsCount,
      pendingActivations: pendingActivationsCount,
      activePOSLicenses: activePOSCount,
      revenueThisMonth: revenueThisMonthStr,
      rpnAgentsCount: onlineRPNAgentsCount,
      pendingVerifications: pendingVerificationsCount
    };
  }, [vendors, activationRequests, posLicenses, financeRecords, rpnAgents]);

  const value = {
    // Session state
    isGoogleLoggedIn,
    setIsGoogleLoggedIn,
    googleEmail,
    setGoogleEmail,
    currentCompany,
    setCurrentCompany,
    currentAdmin,
    setCurrentAdmin,
    searchQuery,
    setSearchQuery,
    
    // Lists
    vendors,
    setVendors,
    plans,
    setPlans,
    posLicenses,
    setPosLicenses,
    appLicenses,
    activationRequests,
    rpnAgents,
    setRpnAgents,
    auditLogs,
    financeRecords,
    setFinanceRecords,
    notifications,
    systemConfig,
    integrations,
    selectedAuditActor,
    setSelectedAuditActor,

    // Calculations
    computedStats,

    // Modifiers
    addLogAndNotify,
    handleCreateVendor,
    handleApproveVendor,
    handleUpdateVendorStatus,
    handleDeleteVendor,
    handleIssuePOSLicense,
    handleRevokePOSLicense,
    handleRenewPOSLicense,
    handleActivateAppLicense,
    handleToggleAppStatus,
    handleApproveRequest,
    handleRejectRequest,
    handlePingNode,
    handleToggleIntegrationService,
    handleSaveSystemConfig,
    handleMarkAllRead,
    handleClearNotifications,
    handleToggleRead,
    handleResetState,

    // Demo Mode States & Actions
    isDemoActive,
    demoVendor,
    startVendorDemo,
    resetDemoData,
    convertDemoToPaidPlan
  };

  return (
    <LifecycleContext.Provider value={value}>
      {children}
    </LifecycleContext.Provider>
  );
}

/* ==========================================================================
   ROUTE INTEGRATION GATES
   ========================================================================== */

function LoginRoute() {
  const { isGoogleLoggedIn, setIsGoogleLoggedIn, setGoogleEmail } = useLifecycle();
  if (isGoogleLoggedIn) return <Navigate to="/company-selector" replace />;
  return (
    <GoogleLoginView 
      onLogin={(email) => {
        setGoogleEmail(email);
        setIsGoogleLoggedIn(true);
      }} 
    />
  );
}

function CompanyRoute() {
  const { isGoogleLoggedIn, currentCompany, setCurrentCompany } = useLifecycle();
  if (!isGoogleLoggedIn) return <Navigate to="/login" replace />;
  return (
    <CompanySelectorView 
      onSelectCompany={setCurrentCompany} 
      selectedCompany={currentCompany} 
    />
  );
}

function StaffRoute() {
  const { isGoogleLoggedIn, currentCompany, currentAdmin, setCurrentAdmin } = useLifecycle();
  if (!isGoogleLoggedIn) return <Navigate to="/login" replace />;
  if (!currentCompany) return <Navigate to="/company-selector" replace />;
  return (
    <POSLicenseGuard>
      <StaffAccessView 
        onSelectAdmin={setCurrentAdmin} 
        selectedAdmin={currentAdmin} 
      />
    </POSLicenseGuard>
  );
}

// Protected layout with standard sidebar and header frame
function RequireAuthLayout() {
  const { 
    isGoogleLoggedIn, 
    googleEmail,
    currentCompany, 
    currentAdmin, 
    setCurrentAdmin, 
    setCurrentCompany,
    notifications,
    handleMarkAllRead,
    activationRequests,
    searchQuery,
    setSearchQuery,
    handleResetState,
    vendors,
    isDemoActive
  } = useLifecycle();

  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to Google Login or company/staff if missing session keys
  if (!isGoogleLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (!currentCompany) {
    return <Navigate to="/company-selector" replace />;
  }
  if (!currentAdmin) {
    return <Navigate to="/staff-access" replace />;
  }

  // Active tab resolver based on path matching
  const activeTab = useMemo<SidebarTab>(() => {
    const path = location.pathname.substring(1);
    if (path.startsWith('lifecycle')) return 'dashboard'; // Highlight dashboard during lifecycles
    if (path === 'dashboard' || path === '') return 'dashboard';
    return path as SidebarTab;
  }, [location]);

  // Find a mock vendor ID to provide to fast travel controls
  const latestVendorId = useMemo(() => {
    return vendors[0]?.id || 'V-451';
  }, [vendors]);

  return (
    <div id="itred_control_console" className="flex h-screen bg-[#F4F4F1] text-[#1A1A1A] font-sans overflow-hidden select-none relative">
      
      {/* DEMO MODE Watermark Overlay */}
      {isDemoActive && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.03] select-none flex items-center justify-center flex-wrap gap-12 rotate-[-15deg]">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="text-4xl font-mono font-black uppercase tracking-widest whitespace-nowrap">
              DEMO MODE • LOCAL ONLY
            </div>
          ))}
        </div>
      )}

      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          navigate(`/${tab}`);
          setSearchQuery(''); // Reset search upon navigation
        }}
        unreadNotificationsCount={notifications.filter((n: any) => !n.read).length}
        pendingActivationsCount={activationRequests.filter((r: any) => r.status === 'Pending').length}
      />

      {/* 2. DEXTER WINDOW COLUMN (Toolbar + Working Canvas Area) */}
      <div id="dexter_working_column" className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* TOP TOOLBAR */}
        <Toolbar
          currentCompany={currentCompany}
          onCompanyChange={setCurrentCompany}
          currentAdmin={currentAdmin}
          onAdminChange={setCurrentAdmin}
          notifications={notifications}
          onNavigateToNotifications={() => navigate('/notifications')}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          googleEmail={googleEmail}
          vendors={vendors}
          isDemoActive={isDemoActive}
        />

        {/* WORKING AREA WORKING CANVAS */}
        <main id="working_canvas_area" className="flex-1 overflow-y-auto p-8 relative">
          {/* Main active subview container */}
          <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <POSLicenseGuard>
              <Outlet />
            </POSLicenseGuard>
          </div>
        </main>

        {/* FOOTER STATUS */}
        <footer className="h-8 bg-[#1A1A1A] text-[#8E9299] text-[9px] px-8 flex items-center justify-between shrink-0 font-mono tracking-widest relative z-10">
          <div className="flex space-x-6">
            <span>LATENCY: 12ms</span>
            <span>SECURITY: Level 4 SSL Active</span>
          </div>
          <div className="flex items-center">
            <span className="w-1.5 h-1.5 bg-green-500 mr-2 rounded-full animate-pulse"></span>
            SYSTEMS NOMINAL — BUILD 4.8.2-RELEASE
          </div>
        </footer>
      </div>

      {/* Floating Simulator Controls Fast Travel Widget */}
      <SimulatorControls 
        onResetState={handleResetState} 
        mockVendorId={latestVendorId} 
      />

    </div>
  );
}

/* ==========================================================================
   INDIVIDUAL ROUTE WRAPPERS MAPPED TO COMPONENT PLUGS
   ========================================================================== */

function DashboardRoute() {
  const { computedStats, auditLogs, vendors } = useLifecycle();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Beautiful Guided User Journey Banner */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] border-4 border-[#1A1A1A] p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Subtle decorative mesh */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#FF5A00]/10 skew-x-12 translate-x-10" />
        
        <div className="space-y-2 max-w-2xl relative z-10 font-mono">
          <div className="flex items-center space-x-2 text-[#FF5A00] font-bold text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 bg-[#FF5A00] rounded-full animate-pulse" />
            <span>VENDOR LIFECYCLE SIMULATOR PROTOCOLS</span>
          </div>
          <h2 className="text-lg font-bold font-sans uppercase tracking-wide">
            SIMULATE VENDOR LIFECYCLE (PHASES 5 - 11)
          </h2>
          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            Provision and certification flow: Create a mock vendor, route through compliance audit checklists, assign transactional pricing slabs, generate hardware keys, activate integration plugins, and verify final ready metrics.
          </p>
        </div>

        <button
          onClick={() => navigate('/lifecycle/create-vendor')}
          className="bg-[#FF5A00] hover:bg-white text-white hover:text-[#1A1A1A] px-6 py-3 font-sans font-black text-xs uppercase tracking-wider transition-all rounded-none shrink-0 cursor-pointer shadow-lg active:translate-y-0.5"
        >
          START LIFECYCLE WIZARD
        </button>
      </div>

      <DashboardView
        stats={computedStats}
        recentLogs={auditLogs}
        onQuickAction={(actionId) => {
          if (actionId === 'create_vendor') {
            navigate('/lifecycle/create-vendor');
          } else if (actionId === 'approve_vendor') {
            const pendingVendor = vendors.find((v: any) => v.status === 'Pending Verification');
            if (pendingVendor) {
              navigate(`/lifecycle/admin-approval/${pendingVendor.id}`);
            } else {
              navigate('/lifecycle/create-vendor');
            }
          } else if (actionId === 'issue_pos') {
            const activeVendor = vendors.find((v: any) => v.status === 'Active');
            if (activeVendor) {
              navigate(`/lifecycle/issue-pos-license/${activeVendor.id}`);
            } else {
              navigate('/lifecycle/create-vendor');
            }
          } else if (actionId === 'activate_app') {
            const activeVendor = vendors.find((v: any) => v.status === 'Active');
            if (activeVendor) {
              navigate(`/lifecycle/activate-apps/${activeVendor.id}`);
            } else {
              navigate('/lifecycle/create-vendor');
            }
          } else {
            navigate('/plans');
          }
        }}
      />
    </div>
  );
}

function VendorsRoute() {
  const { vendors, searchQuery, handleUpdateVendorStatus, handleDeleteVendor } = useLifecycle();
  const navigate = useNavigate();
  return (
    <VendorManagementView
      vendors={vendors}
      searchQuery={searchQuery}
      onAddVendorClick={() => navigate('/lifecycle/create-vendor')}
      onUpdateVendorStatus={handleUpdateVendorStatus}
      onDeleteVendor={handleDeleteVendor}
    />
  );
}

function PlansRoute() {
  return <PlansPricingView />;
}

function POSRoute() {
  return <POSLicensingView />;
}

function AppsRoute() {
  const { appLicenses, searchQuery, handleToggleAppStatus, vendors } = useLifecycle();
  const navigate = useNavigate();
  return (
    <AppLicensingView
      appLicenses={appLicenses}
      searchQuery={searchQuery}
      onActivateAppClick={() => {
        const activeVendor = vendors.find((v: any) => v.status === 'Active');
        navigate(activeVendor ? `/lifecycle/activate-apps/${activeVendor.id}` : '/lifecycle/create-vendor');
      }}
      onToggleAppStatus={handleToggleAppStatus}
    />
  );
}

function ActivationsRoute() {
  const { activationRequests, handleApproveRequest, handleRejectRequest } = useLifecycle();
  return (
    <ActivationRequestsView
      requests={activationRequests}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
    />
  );
}

function RPNRoute() {
  const { rpnAgents, handlePingNode, vendors } = useLifecycle();
  return (
    <RPNManagementView
      rpnAgents={rpnAgents}
      onPingNode={handlePingNode}
      vendors={vendors}
    />
  );
}

function FinanceRoute() {
  return <FinanceView />;
}

function NotificationsRoute() {
  const { notifications, handleMarkAllRead, handleClearNotifications, handleToggleRead } = useLifecycle();
  return (
    <NotificationsView
      notifications={notifications}
      onMarkAllRead={handleMarkAllRead}
      onClearNotifications={handleClearNotifications}
      onToggleRead={handleToggleRead}
    />
  );
}

function AuditRoute() {
  const { auditLogs, searchQuery, selectedAuditActor, setSelectedAuditActor } = useLifecycle();
  return (
    <AuditLogsView
      logs={auditLogs}
      searchQuery={searchQuery}
      onActorFilter={setSelectedAuditActor}
      selectedActor={selectedAuditActor}
    />
  );
}

function SettingsRoute() {
  const { systemConfig, handleSaveSystemConfig } = useLifecycle();
  return (
    <SystemSettingsView
      config={systemConfig}
      onSaveConfig={handleSaveSystemConfig}
    />
  );
}

function IntegrationsRoute() {
  const { integrations, handleToggleIntegrationService } = useLifecycle();
  return (
    <IntegrationsView
      services={integrations}
      onToggleService={handleToggleIntegrationService}
    />
  );
}

function EcosystemRoute() {
  return <EcosystemDashboardView />;
}

function AIAnalystRoute() {
  return <AIAnalystView />;
}

function DiagnosticsRoute() {
  return <SCIDiagnosticsView />;
}

/* ==========================================================================
   WIZARD WRAPPERS
   ========================================================================== */

function CreateVendorRoute() {
  const { handleCreateVendor, vendors, rpnAgents } = useLifecycle();
  return <CreateVendorWizard onCreateVendor={handleCreateVendor} vendors={vendors} rpnAgents={rpnAgents} />;
}

function PendingVerificationRoute() {
  const { vendors } = useLifecycle();
  return <PendingVerificationWizard vendors={vendors} />;
}

function AdminApprovalRoute() {
  const { vendors, handleApproveVendor } = useLifecycle();
  return <AdminApprovalWizard vendors={vendors} onApproveVendor={handleApproveVendor} />;
}

function AssignPlanRoute() {
  const { vendors, plans } = useLifecycle();
  return <AssignPlanWizard vendors={vendors} plans={plans} />;
}

function IssuePOSLicenseRoute() {
  const { vendors, handleIssuePOSLicense } = useLifecycle();
  return <IssuePOSLicenseWizard vendors={vendors} onIssueLicense={handleIssuePOSLicense} />;
}

function ActivateAppsRoute() {
  const { vendors, handleActivateAppLicense } = useLifecycle();
  return <ActivateAppsWizard vendors={vendors} onActivateApp={handleActivateAppLicense} />;
}

function VendorReadyRoute() {
  const { vendors } = useLifecycle();
  return <VendorReadyWizard vendors={vendors} />;
}
