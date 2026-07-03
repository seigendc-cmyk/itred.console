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
import { ShieldAlert } from 'lucide-react';

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
import MenuFeaturesView from './components/internal/MenuFeaturesView';
import StaffManagementView from './components/internal/StaffManagementView';
import StaffRoleCreatorView from './components/internal/StaffRoleCreatorView';
import StaffDeskCreatorView from './components/internal/StaffDeskCreatorView';
import CapacityView from './components/internal/CapacityView';
import ErrorBoundary from './components/ErrorBoundary';
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
  IntegrationService,
  StaffMember,
  StaffDesk,
  MenuFeature
} from './types';

import {
  SCIInternalStaff,
  SCIStaffRole,
  SCIStaffDesk,
  SCIMenuFeature,
  SCIStaffSession,
  INITIAL_MENU_FEATURES,
  INITIAL_STAFF_ROLES,
  INITIAL_STAFF_DESKS,
  INITIAL_INTERNAL_STAFF,
  getInternalStaff,
  saveInternalStaff,
  getStaffRoles,
  saveStaffRoles,
  getStaffDesks,
  saveStaffDesks,
  getMenuFeatures,
  saveMenuFeatures,
  createStaffSession,
  getStaffSession
} from './internal';

import {
  SCIWorkspaceCode,
  SCI_WORKSPACES,
  resolveWorkspaceAccess,
  switchStaffDesk,
  buildAccessRestrictedViewModel,
  SCIEnvironmentMode,
  getSCIEnvironmentMode,
  setSCIEnvironmentMode,
  getSCIEnvironmentState,
  getWorkspaceNotifications,
  markWorkspaceNotificationRead,
  addWorkspaceNotification,
  SCIWorkspaceNotification,
  getWorkspaceAuditEvents,
  addWorkspaceAuditEvent,
  SCIWorkspaceAuditEvent,
  getWorkspaceActivities,
  addWorkspaceActivity,
  SCIWorkspaceActivity,
  SCIWorkspaceSearchItem,
  clearWorkspaceAuditEvents
} from './workspace';
import {
  getWorkflows,
  addWorkflow,
  updateWorkflow,
  SCIWorkflow
} from './workflow';
import WorkspaceRail from './components/WorkspaceRail';

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
              <Route path="/staff" element={<StaffManagementRoute />} />
              <Route path="/roles" element={<StaffRolesRoute />} />
              <Route path="/desks" element={<StaffDesksRoute />} />
              <Route path="/menu-features" element={<MenuFeaturesRoute />} />
              <Route path="/capacity" element={<CapacityRoute />} />

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

  const [internalStaff, setInternalStaff] = useState<SCIInternalStaff[]>(() => {
    const loaded = getInternalStaff(INITIAL_INTERNAL_STAFF);
    if (loaded.length === 1 && INITIAL_INTERNAL_STAFF.length > 1) {
      return INITIAL_INTERNAL_STAFF;
    }
    return loaded;
  });
  const [staffRoles, setStaffRoles] = useState<SCIStaffRole[]>(() => {
    const loaded = getStaffRoles(INITIAL_STAFF_ROLES);
    if (loaded.length < INITIAL_STAFF_ROLES.length) {
      return INITIAL_STAFF_ROLES;
    }
    return loaded;
  });
  const [staffDesks, setStaffDesks] = useState<SCIStaffDesk[]>(() => {
    const loaded = getStaffDesks(INITIAL_STAFF_DESKS);
    if (loaded.length === 2 && INITIAL_STAFF_DESKS.length > 2) {
      return INITIAL_STAFF_DESKS;
    }
    return loaded;
  });
  const [internalMenuFeatures, setInternalMenuFeatures] = useState<SCIMenuFeature[]>(() => {
    return getMenuFeatures(INITIAL_MENU_FEATURES);
  });
  const [activeStaffSession, setActiveStaffSession] = useState<SCIStaffSession | null>(() => {
    let sess = getStaffSession();
    if (!sess && INITIAL_INTERNAL_STAFF.length > 0) {
      const sa = INITIAL_INTERNAL_STAFF[0];
      const saRole = INITIAL_STAFF_ROLES.find(r => r.roleId === sa.roleId);
      const saDesk = INITIAL_STAFF_DESKS.find(d => d.deskId === sa.defaultDeskId);
      if (sa && saRole && saDesk) {
        sess = createStaffSession({ staff: sa, role: saRole, desk: saDesk });
      }
    }
    return sess;
  });

  React.useEffect(() => {
    saveInternalStaff(internalStaff);
  }, [internalStaff]);

  React.useEffect(() => {
    saveStaffRoles(staffRoles);
  }, [staffRoles]);

  React.useEffect(() => {
    saveStaffDesks(staffDesks);
  }, [staffDesks]);

  React.useEffect(() => {
    saveMenuFeatures(internalMenuFeatures);
  }, [internalMenuFeatures]);

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

  // ==========================================================================
  // SCI WORKSPACE STATE INTEGRATIONS
  // ==========================================================================
  const [envMode, setEnvMode] = useState<SCIEnvironmentMode>(() => {
    return getSCIEnvironmentMode();
  });

  const [workspaceNotifications, setWorkspaceNotifications] = useState<SCIWorkspaceNotification[]>(() => {
    return getWorkspaceNotifications();
  });

  const [workspaceAuditEvents, setWorkspaceAuditEvents] = useState<SCIWorkspaceAuditEvent[]>(() => {
    return getWorkspaceAuditEvents();
  });

  const [workspaceActivities, setWorkspaceActivities] = useState<SCIWorkspaceActivity[]>(() => {
    return getWorkspaceActivities();
  });

  const [workflows, setWorkflows] = useState<SCIWorkflow[]>(() => {
    const existing = getWorkflows();
    if (existing.length === 0) {
      const seed: Omit<SCIWorkflow, "workflowId" | "createdAt" | "updatedAt">[] = [
        {
          workflowType: "vendor_activation",
          title: "SparkCorp Onboarding",
          description: "Compliance document verification & gateway setup.",
          status: "pending",
          requesterId: "staff_01",
          requesterName: "Sarah Jenkins",
          currentStep: 2,
          totalSteps: 5
        },
        {
          workflowType: "pos_license",
          title: "POS Terminal Key Generation",
          description: "Cryptographic keys for Alpha Demo Store terminal.",
          status: "submitted",
          requesterId: "staff_02",
          requesterName: "Marcus Vance",
          currentStep: 1,
          totalSteps: 3
        }
      ];
      seed.forEach(w => addWorkflow(w));
      return getWorkflows();
    }
    return existing;
  });

  const handleSetEnvMode = (mode: SCIEnvironmentMode) => {
    setSCIEnvironmentMode(mode);
    setEnvMode(mode);
    // Also record environment change audit event
    addWorkspaceAuditEvent({
      workspaceId: 'platform',
      actorStaffId: activeStaffSession?.staffId,
      actorName: activeStaffSession?.fullName || 'System',
      activeDeskId: activeStaffSession?.activeDeskId,
      action: 'ENVIRONMENT_MODE_CHANGE',
      targetType: 'environment',
      targetId: mode,
      result: 'success',
      message: `Environment mode switched to ${mode}.`
    });
    setWorkspaceAuditEvents(getWorkspaceAuditEvents());
  };

  const handleMarkWorkspaceNotificationRead = (id: string) => {
    markWorkspaceNotificationRead(id);
    setWorkspaceNotifications(getWorkspaceNotifications());
  };

  const handleAddWorkspaceAuditEvent = (event: Omit<SCIWorkspaceAuditEvent, "auditId" | "createdAt">) => {
    addWorkspaceAuditEvent(event);
    setWorkspaceAuditEvents(getWorkspaceAuditEvents());
  };

  const handleClearWorkspaceAuditEvents = () => {
    clearWorkspaceAuditEvents();
    setWorkspaceAuditEvents([]);
  };

  const handleAddWorkflow = (w: Omit<SCIWorkflow, "workflowId" | "createdAt" | "updatedAt">) => {
    addWorkflow(w);
    setWorkflows(getWorkflows());
  };

  const handleUpdateWorkflow = (id: string, updates: Partial<SCIWorkflow>) => {
    updateWorkflow(id, updates);
    setWorkflows(getWorkflows());
  };

  const handleAddWorkspaceNotification = (notif: Omit<SCIWorkspaceNotification, "notificationId" | "createdAt" | "read">) => {
    addWorkspaceNotification(notif);
    setWorkspaceNotifications(getWorkspaceNotifications());
  };

  const handleAddWorkspaceActivity = (activity: Omit<SCIWorkspaceActivity, "activityId" | "createdAt">) => {
    addWorkspaceActivity(activity);
    setWorkspaceActivities(getWorkspaceActivities());
  };

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
    setInternalMenuFeatures(INITIAL_MENU_FEATURES);
    setStaffDesks(INITIAL_STAFF_DESKS);
    setInternalStaff(INITIAL_INTERNAL_STAFF);
    setStaffRoles(INITIAL_STAFF_ROLES);
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
    
    internalStaff,
    setInternalStaff,
    staffRoles,
    setStaffRoles,
    staffDesks,
    setStaffDesks,
    internalMenuFeatures,
    setInternalMenuFeatures,
    activeStaffSession,
    setActiveStaffSession,

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
    convertDemoToPaidPlan,

    // SCI Workspace integrations
    envMode,
    onChangeEnvMode: handleSetEnvMode,
    workspaceNotifications,
    onMarkWorkspaceNotificationRead: handleMarkWorkspaceNotificationRead,
    onAddWorkspaceNotification: handleAddWorkspaceNotification,
    workspaceAuditEvents,
    onAddWorkspaceAuditEvent: handleAddWorkspaceAuditEvent,
    onClearWorkspaceAuditEvents: handleClearWorkspaceAuditEvents,
    workspaceActivities,
    setWorkspaceActivities,
    onAddWorkspaceActivity: handleAddWorkspaceActivity,
    workflows,
    onAddWorkflow: handleAddWorkflow,
    onUpdateWorkflow: handleUpdateWorkflow
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
  if (isGoogleLoggedIn) return <Navigate to="/staff-access" replace />;
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
  return <Navigate to="/staff-access" replace />;
}

function StaffRoute() {
  const { 
    isGoogleLoggedIn, 
    googleEmail,
    internalStaff, 
    staffRoles, 
    staffDesks, 
    internalMenuFeatures,
    activeStaffSession, 
    setActiveStaffSession 
  } = useLifecycle();

  if (!isGoogleLoggedIn) return <Navigate to="/login" replace />;

  const handleLoginSuccess = (session: SCIStaffSession) => {
    setActiveStaffSession(session);
    localStorage.setItem('sci_staff_session', JSON.stringify(session));
    addWorkspaceAuditEvent({
      workspaceId: 'home',
      actorStaffId: session.staffId,
      actorName: session.fullName,
      activeDeskId: session.activeDeskId,
      action: 'STAFF_LOGIN',
      targetType: 'session',
      result: 'success',
      message: `Staff member ${session.fullName} logged into desk ${session.activeDeskId}.`
    });
  };

  return (
    <StaffAccessView 
      internalStaff={internalStaff}
      staffRoles={staffRoles}
      staffDesks={staffDesks}
      menuFeatures={internalMenuFeatures}
      activeStaffSession={activeStaffSession}
      onLoginSuccess={handleLoginSuccess}
      googleEmail={googleEmail}
    />
  );
}

// Protected layout with standard sidebar and header frame
function RequireAuthLayout() {
  const { 
    isGoogleLoggedIn, 
    googleEmail,
    notifications,
    handleMarkAllRead,
    activationRequests,
    searchQuery,
    setSearchQuery,
    vendors,
    activeStaffSession,
    setActiveStaffSession,
    internalStaff,
    staffRoles,
    staffDesks,
    handleResetState,

    // SCI Workspace states and modifiers
    envMode,
    onChangeEnvMode,
    workspaceNotifications,
    onMarkWorkspaceNotificationRead,
    onAddWorkspaceAuditEvent,
    workspaceActivities,
    workflows
  } = useLifecycle();

  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to Google Login or staff access portal if missing session keys
  if (!isGoogleLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (!activeStaffSession) {
    return <Navigate to="/staff-access" replace />;
  }

  // Active tab resolver based on path matching
  const activeTab = useMemo<SidebarTab>(() => {
    const path = location.pathname.substring(1);
    if (path.startsWith('lifecycle')) return 'dashboard'; // Highlight dashboard during lifecycles
    if (path === 'dashboard' || path === '') return 'dashboard';
    if (path === 'staff') return 'staff_management';
    if (path === 'roles') return 'role_creator';
    if (path === 'desks') return 'desk_creator';
    if (path === 'menu-features') return 'menu_features';
    return path as SidebarTab;
  }, [location]);

  // Find a mock vendor ID to provide to fast travel controls
  const latestVendorId = useMemo(() => {
    return vendors[0]?.id || 'V-451';
  }, [vendors]);

  const activeWorkspaceId = useMemo<SCIWorkspaceCode>(() => {
    const path = location.pathname.substring(1);
    if (path === 'dashboard' || path === '' || path.startsWith('lifecycle')) return 'home';
    if (path === 'vendors' || path === 'activations') return 'vendor_operations';
    if (path === 'plans' || path === 'pos' || path === 'apps') return 'licensing_centre';
    if (path === 'capacity') return 'commercial';
    if (path === 'staff' || path === 'roles' || path === 'desks' || path === 'menu-features') return 'internal_administration';
    if (path === 'rpn') return 'rpn_operations';
    if (path === 'finance') return 'finance';
    if (path === 'diagnostics' || path === 'integrations' || path === 'settings' || path === 'audit' || path === 'notifications') return 'platform';
    return 'home';
  }, [location.pathname]);

  const activeWorkspace = useMemo(() => {
    return SCI_WORKSPACES.find(w => w.workspaceId === activeWorkspaceId);
  }, [activeWorkspaceId]);

  const currentWorkspaceAccess = useMemo(() => {
    if (!activeWorkspace) return { allowed: false, message: "No active workspace.", reasonCode: "NO_WORKSPACE" };
    return resolveWorkspaceAccess({
      workspace: activeWorkspace,
      session: activeStaffSession
    });
  }, [activeWorkspace, activeStaffSession]);

  const accessRestrictedVM = useMemo(() => {
    if (currentWorkspaceAccess.allowed) return null;
    return buildAccessRestrictedViewModel({
      reasonCode: currentWorkspaceAccess.reasonCode,
      activeDesk: activeStaffSession?.activeDeskId,
      requiredFeatureIds: activeWorkspace?.featureIds,
      grantedFeatureIds: activeStaffSession?.grantedMenuFeatureIds
    });
  }, [currentWorkspaceAccess, activeWorkspace, activeStaffSession]);

  // Effect to log audit events on restricted access attempts
  React.useEffect(() => {
    if (!currentWorkspaceAccess.allowed && activeStaffSession && activeWorkspace) {
      onAddWorkspaceAuditEvent({
        workspaceId: activeWorkspace.workspaceId,
        actorStaffId: activeStaffSession.staffId,
        actorName: activeStaffSession.fullName,
        activeDeskId: activeStaffSession.activeDeskId,
        action: 'RESTRICTED_ACCESS_ATTEMPT',
        targetType: 'workspace',
        targetId: activeWorkspace.workspaceId,
        result: 'blocked',
        message: `Attempted access to blocked workspace: ${activeWorkspace.label}. Reason: ${currentWorkspaceAccess.message}`
      });
    }
  }, [currentWorkspaceAccess.allowed, activeWorkspaceId, activeStaffSession?.activeDeskId]);

  const handleDeskSwitch = (deskId: string) => {
    if (!activeStaffSession) return;
    const staff = internalStaff.find(s => s.staffId === activeStaffSession.staffId);
    const role = staffRoles.find(r => r.roleId === activeStaffSession.roleId);
    const desk = staffDesks.find(d => d.deskId === deskId);

    if (!staff || !role || !desk) {
      alert("Error: Missing internal profile or desk configuration.");
      return;
    }

    const decision = switchStaffDesk({ staff, role, desk });

    if (decision.allowed && decision.session) {
      setActiveStaffSession(decision.session);
      onAddWorkspaceAuditEvent({
        workspaceId: activeWorkspaceId,
        actorStaffId: activeStaffSession.staffId,
        actorName: activeStaffSession.fullName,
        activeDeskId: deskId,
        action: 'DESK_SWITCH',
        targetType: 'desk',
        targetId: deskId,
        result: 'success',
        message: `Switched active desk console to "${desk.deskName}".`
      });
      alert(`Success: Switched active desk console to "${desk.deskName}".`);
    } else {
      onAddWorkspaceAuditEvent({
        workspaceId: activeWorkspaceId,
        actorStaffId: activeStaffSession.staffId,
        actorName: activeStaffSession.fullName,
        activeDeskId: activeStaffSession.activeDeskId,
        action: 'DESK_SWITCH',
        targetType: 'desk',
        targetId: deskId,
        result: 'blocked',
        message: `Blocked desk switch to "${desk.deskName}": ${decision.message}`
      });
      alert(`Access Blocked: ${decision.message}`);
    }
  };

  // Environment state configurations
  const environmentState = getSCIEnvironmentState();
  const showDemoWatermark = environmentState.demoWatermarkEnabled;

  // Resolve activities for selected workspace
  const currentActivities = useMemo(() => {
    return workspaceActivities.filter(act => act.workspaceId === activeWorkspaceId);
  }, [workspaceActivities, activeWorkspaceId]);

  // Resolve pending approvals list (workflows & activation requests)
  const pendingApprovalsList = useMemo(() => {
    const list: { id: string; label: string; desc: string; type: string; path?: string }[] = [];
    workflows.forEach(w => {
      if (w.status === 'pending' || w.status === 'submitted') {
        list.push({
          id: w.workflowId,
          label: `${w.workflowType.toUpperCase()}: ${w.title}`,
          desc: w.description,
          type: 'workflow'
        });
      }
    });
    activationRequests.forEach(r => {
      if (r.status === 'Pending') {
        list.push({
          id: r.id,
          label: `ACTIVATION: ${r.vendorName}`,
          desc: `App activation request for ${r.appName || 'Vendor'}.`,
          type: 'activation',
          path: '/activations'
        });
      }
    });
    return list;
  }, [workflows, activationRequests]);

  return (
    <div id="itred_control_console" className="flex flex-col h-screen bg-[#F4F4F1] text-[#1A1A1A] font-sans overflow-hidden select-none relative">
      
      {/* DEMO MODE Watermark Overlay */}
      {showDemoWatermark && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.03] select-none flex items-center justify-center flex-wrap gap-12 rotate-[-15deg]">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="text-4xl font-mono font-black uppercase tracking-widest whitespace-nowrap">
              {environmentState.label.toUpperCase()} • LOCAL ONLY
            </div>
          ))}
        </div>
      )}

      {/* TOP COMMAND BAR */}
      <Toolbar
        activeStaffSession={activeStaffSession}
        onLogout={() => {
          if (activeStaffSession) {
            onAddWorkspaceAuditEvent({
              workspaceId: activeWorkspaceId,
              actorStaffId: activeStaffSession.staffId,
              actorName: activeStaffSession.fullName,
              activeDeskId: activeStaffSession.activeDeskId,
              action: 'STAFF_LOGOUT',
              targetType: 'session',
              result: 'success',
              message: `Staff member ${activeStaffSession.fullName} logged out.`
            });
          }
          setActiveStaffSession(null);
          setIsGoogleLoggedIn(false);
          localStorage.removeItem('sci_staff_session');
          localStorage.removeItem('sgn_is_logged_in');
          navigate('/login');
        }}
        notifications={workspaceNotifications}
        onNavigateToNotifications={() => navigate('/notifications')}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        activeWorkspaceLabel={activeWorkspace?.label || 'Home'}
        internalStaff={internalStaff}
        staffRoles={staffRoles}
        staffDesks={staffDesks}
        onDeskSwitch={handleDeskSwitch}
        envMode={envMode}
        onChangeEnvMode={onChangeEnvMode}
        onMarkNotificationRead={onMarkWorkspaceNotificationRead}
        onCommandClick={(item) => {
          if (activeStaffSession) {
            onAddWorkspaceAuditEvent({
              workspaceId: activeWorkspaceId,
              actorStaffId: activeStaffSession.staffId,
              actorName: activeStaffSession.fullName,
              activeDeskId: activeStaffSession.activeDeskId,
              action: 'CLICK_COMMAND',
              targetType: 'command',
              targetId: item.searchId,
              result: 'success',
              message: `Clicked command: ${item.label}.`
            });
          }
        }}
      />

      {/* MAIN CONTAINER SHELL */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        
        {/* Workspace Rail (Far-Left) */}
        <WorkspaceRail
          activeWorkspaceId={activeWorkspaceId}
          onWorkspaceSelect={(path) => {
            navigate(path);
          }}
          activeStaffSession={activeStaffSession}
        />

        {/* Secondary Navigation Panel */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'staff_management') {
              navigate('/staff');
            } else if (tab === 'role_creator') {
              navigate('/roles');
            } else if (tab === 'desk_creator') {
              navigate('/desks');
            } else if (tab === 'menu_features') {
              navigate('/menu-features');
            } else {
              navigate(`/${tab}`);
            }
            setSearchQuery(''); // Reset search upon navigation
          }}
          unreadNotificationsCount={workspaceNotifications.filter((n: any) => !n.read).length}
          pendingActivationsCount={activationRequests.filter((r: any) => r.status === 'Pending').length}
          activeStaffSession={activeStaffSession}
          activeWorkspaceId={activeWorkspaceId}
        />

        {/* Main Content Area */}
        <main id="working_canvas_area" className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {currentWorkspaceAccess.allowed ? (
              <Outlet />
            ) : (
              <div id="access_restricted_panel" className="bg-white border-4 border-[#1A1A1A] p-10 max-w-2xl mx-auto text-left space-y-6 shadow-2xl relative mt-12 font-mono text-[#1A1A1A]">
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />
                
                {/* Title and Badge */}
                <div className="flex items-center space-x-3 text-[#FF5A00] border-b-2 border-[#1A1A1A] pb-4">
                  <ShieldAlert className="w-9 h-9 shrink-0 text-[#FF5A00]" />
                  <div>
                    <h2 className="text-base font-black uppercase tracking-widest font-sans text-[#1A1A1A]">
                      {accessRestrictedVM?.title || 'Access Restricted'}
                    </h2>
                    <span className="text-[9px] bg-red-650 text-white px-2 py-0.5 uppercase font-black tracking-wider">
                      Clearance Blocked
                    </span>
                  </div>
                </div>

                {/* Denial Explanation */}
                <div className="space-y-1 bg-red-50/50 p-4 border border-red-200">
                  <div className="text-[9px] text-red-500 uppercase font-black">REASON FOR DENIAL</div>
                  <p className="text-xs text-red-750 font-bold leading-relaxed font-sans">
                    {currentWorkspaceAccess.message || accessRestrictedVM?.message}
                  </p>
                </div>

                {/* Profiles & Terminal status */}
                <div className="grid grid-cols-2 gap-4 bg-[#FAF9F6] p-4 border-2 border-[#1A1A1A] text-[9px] uppercase font-bold text-gray-600">
                  <div>
                    <span className="text-gray-400 block text-[8px] font-black">Active Operator Profile:</span>
                    <div className="text-[#1A1A1A] font-black text-xs font-sans mt-0.5">{activeStaffSession?.fullName}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[8px] font-black">Active Terminal Desk:</span>
                    <div className="text-[#1A1A1A] font-black text-xs font-sans mt-0.5">{accessRestrictedVM?.activeDesk}</div>
                  </div>
                </div>

                {/* Clearance Specifications Compare */}
                <div className="grid grid-cols-2 gap-6 bg-stone-50 p-4 border border-[#D1D1CF]">
                  <div className="space-y-2">
                    <div className="text-[9px] text-[#1A1A1A] uppercase font-black border-b border-[#D1D1CF] pb-1.5">Required Clearances</div>
                    <div className="flex flex-wrap gap-1">
                      {accessRestrictedVM?.requiredFeatureIds?.map(f => (
                        <span key={f} className="bg-stone-200 text-stone-850 px-1.5 py-0.5 text-[8px] font-mono select-all font-bold">
                          {f}
                        </span>
                      )) || <span className="text-gray-400 italic">None</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[9px] text-[#1A1A1A] uppercase font-black border-b border-[#D1D1CF] pb-1.5">Granted Clearances</div>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {accessRestrictedVM?.grantedFeatureIds?.map(f => (
                        <span key={f} className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 text-[8px] font-mono select-all border border-emerald-150 font-bold">
                          {f}
                        </span>
                      )) || <span className="text-gray-400 italic">None</span>}
                    </div>
                  </div>
                </div>

                {/* Desk Switcher Actions footer */}
                <div className="pt-4 border-t-2 border-[#1A1A1A] flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-white border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all text-[10px] font-black uppercase tracking-wider rounded-none cursor-pointer font-sans"
                  >
                    Return to Dashboard
                  </button>

                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] text-gray-500 font-black uppercase font-sans">Quick Switch Desk:</span>
                    <select
                      value={activeStaffSession?.activeDeskId}
                      onChange={(e) => handleDeskSwitch(e.target.value)}
                      className="bg-white border-2 border-[#1A1A1A] text-[10px] font-black focus:outline-none uppercase px-3 py-1.5 font-sans cursor-pointer rounded-none"
                    >
                      {staffDesks
                        .filter(d => {
                          const activeStaff = internalStaff.find(s => s.staffId === activeStaffSession?.staffId);
                          return activeStaff?.assignedDeskIds.includes(d.deskId);
                        })
                        .map(d => (
                          <option key={d.deskId} value={d.deskId}>
                            {d.deskName} ({d.deskCode})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>

        {/* Right Utility Panel */}
        <div id="right_utility_panel" className="w-64 border-l border-[#D1D1CF] bg-[#FAF9F6] overflow-y-auto p-4 space-y-6 hidden xl:block shrink-0 font-mono text-[10px] text-[#1A1A1A]">
          
          {/* Recent Activity Card */}
          <div className="space-y-2">
            <div className="font-black text-[#FF5A00] uppercase tracking-wider border-b border-[#D1D1CF] pb-1.5 flex items-center justify-between">
              <span>Recent Activity</span>
              <span className="w-1.5 h-1.5 bg-[#FF5A00] rounded-none animate-pulse" />
            </div>
            <div className="space-y-1.5 leading-relaxed text-gray-500 font-sans max-h-40 overflow-y-auto pr-1">
              {currentActivities.length === 0 ? (
                <div className="text-[8px] text-gray-400 italic font-mono uppercase">NO RECENT WORKSPACE ACTIVITY</div>
              ) : (
                currentActivities.map((act) => (
                  <div key={act.activityId} className="bg-white p-2 border border-gray-200 rounded-none font-mono text-[9px] text-[#1A1A1A] flex flex-col gap-0.5">
                    <div className="flex justify-between items-center text-[7px] text-gray-400 font-mono">
                      <span>[{new Date(act.createdAt).toLocaleTimeString()}]</span>
                      <span className={`px-1 py-0.2 font-bold uppercase border ${
                        act.severity === 'critical' ? 'border-red-500 text-red-600 bg-red-50' :
                        act.severity === 'warning' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
                        act.severity === 'success' ? 'border-green-500 text-green-600 bg-green-50' :
                        'border-blue-500 text-blue-600 bg-blue-50'
                      }`}>{act.severity}</span>
                    </div>
                    <div className="font-bold text-[#1A1A1A] uppercase text-[8px] truncate mt-0.5">{act.title}</div>
                    <div className="text-[8px] text-gray-500 normal-case leading-normal">{act.message}</div>
                    <div className="text-[7px] text-gray-400 mt-0.5 font-bold">OPERATOR: {act.actorName}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Approvals Card */}
          <div className="space-y-2 font-mono">
            <div className="font-black text-gray-850 uppercase tracking-wider border-b border-[#D1D1CF] pb-1.5">
              Pending Approvals
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {pendingApprovalsList.length === 0 ? (
                <div className="text-[8px] text-gray-400 italic">NO PENDING COMPLIANCE RUNS</div>
              ) : (
                pendingApprovalsList.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => item.path && navigate(item.path)}
                    className={`p-2 border rounded-none text-left cursor-pointer transition-all ${
                      item.type === 'activation'
                        ? 'bg-orange-50/50 border-orange-250 hover:bg-orange-50 text-orange-950'
                        : 'bg-white border-stone-200 hover:bg-[#F4F4F1] text-stone-850'
                    }`}
                  >
                    <div className="font-bold text-[8px] truncate">{item.label}</div>
                    <div className="text-[8px] text-gray-500 mt-0.5 font-sans normal-case truncate">{item.desc}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Health Card */}
          <div className="space-y-2 font-mono">
            <div className="font-black text-gray-850 uppercase tracking-wider border-b border-[#D1D1CF] pb-1.5">
              System Health
            </div>
            <div className="bg-white p-3 border border-gray-200 rounded-none space-y-2 uppercase font-bold text-gray-650 text-[9px]">
              <div className="flex justify-between">
                <span>Cluster Ingress:</span>
                <span className="text-green-600">Stable</span>
              </div>
              <div className="flex justify-between">
                <span>Diag Tunnels:</span>
                <span className="text-green-600">99.9% Online</span>
              </div>
              <div className="flex justify-between">
                <span>Sync Node Cluster:</span>
                <span className="text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Env Storage:</span>
                <span className="text-orange-500">{environmentState.storageMode === 'localOnly' ? 'LOCAL ONLY' : 'CLOUD'}</span>
              </div>
              <div className="flex justify-between">
                <span>Firebase DB:</span>
                <span className={environmentState.firebaseWritesAllowed ? 'text-green-600' : 'text-red-500'}>
                  {environmentState.firebaseWritesAllowed ? 'WRITABLE' : 'LOCKED'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="space-y-2 font-mono">
            <div className="font-black text-gray-850 uppercase tracking-wider border-b border-[#D1D1CF] pb-1.5">
              Quick Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  alert("Telemetry logs flushed. Broadcast channel refreshed.");
                  if (activeStaffSession) {
                    onAddWorkspaceAuditEvent({
                      workspaceId: activeWorkspaceId,
                      actorStaffId: activeStaffSession.staffId,
                      actorName: activeStaffSession.fullName,
                      activeDeskId: activeStaffSession.activeDeskId,
                      action: 'CLICK_COMMAND',
                      targetType: 'quick_action',
                      targetId: 'flush_telemetry',
                      result: 'success',
                      message: `Operator triggered telemetry flush for uplink channel.`
                    });
                  }
                }}
                className="w-full text-left p-2 border border-gray-200 hover:border-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-white uppercase font-bold transition-all rounded-none cursor-pointer"
              >
                Flush Telemetry Tunnels
              </button>
              <button
                onClick={() => {
                  alert("Diagnostics ping dispatched across 3 data center regions.");
                  if (activeStaffSession) {
                    onAddWorkspaceAuditEvent({
                      workspaceId: activeWorkspaceId,
                      actorStaffId: activeStaffSession.staffId,
                      actorName: activeStaffSession.fullName,
                      activeDeskId: activeStaffSession.activeDeskId,
                      action: 'CLICK_COMMAND',
                      targetType: 'quick_action',
                      targetId: 'trigger_ping',
                      result: 'success',
                      message: `Operator triggered multi-region diagnostics ping.`
                    });
                  }
                }}
                className="w-full text-left p-2 border border-gray-200 hover:border-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-white uppercase font-bold transition-all rounded-none cursor-pointer"
              >
                Trigger Diagnostic Ping
              </button>
            </div>
          </div>

          {/* Workflow Queue Card */}
          <div className="space-y-2 font-mono">
            <div className="font-black text-gray-850 uppercase tracking-wider border-b border-[#D1D1CF] pb-1.5 flex justify-between items-center">
              <span>Workflow Queue</span>
              <span className="bg-orange-100 text-[#FF5A00] px-1 py-0.2 text-[8px] font-bold">{workflows.length} RUNNING</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {workflows.map((w) => {
                const percent = Math.round((w.currentStep / w.totalSteps) * 100);
                return (
                  <div key={w.workflowId} className="bg-white p-2.5 border border-gray-200 rounded-none space-y-1.5 font-mono">
                    <div className="flex justify-between items-center text-[8px] font-bold">
                      <span className="text-gray-800 uppercase">{w.title}</span>
                      <span className={`px-1 py-0.2 text-[7px] uppercase border ${
                        w.status === 'completed' || w.status === 'approved' ? 'border-green-500 text-green-600 bg-green-50' :
                        w.status === 'rejected' || w.status === 'cancelled' ? 'border-red-500 text-red-600 bg-red-50' :
                        'border-orange-500 text-orange-600 bg-orange-50'
                      }`}>{w.status}</span>
                    </div>
                    <div className="text-[8px] text-gray-500 font-sans normal-case leading-normal">{w.description}</div>
                    
                    {/* Flat Progress Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[7px] text-gray-400 font-mono">
                        <span>STEP {w.currentStep}/{w.totalSteps}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-none overflow-hidden border border-gray-200">
                        <div className="bg-[#FF5A00] h-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

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
        dashboardType={activeStaffSession?.dashboardType}
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
  const { 
    workspaceNotifications, 
    onMarkWorkspaceNotificationRead
  } = useLifecycle();

  // Map SCIWorkspaceNotification to AppNotification
  const mappedNotifications = React.useMemo(() => {
    return workspaceNotifications.map((n: any) => ({
      id: n.notificationId,
      timestamp: n.createdAt,
      title: n.title,
      message: n.message,
      type: (n.type === 'approval' ? 'warning' : (n.type === 'security' ? 'alert' : n.type === 'license' ? 'info' : n.type)) as any,
      read: n.read
    }));
  }, [workspaceNotifications]);

  const handleMarkAllRead = () => {
    workspaceNotifications.forEach((n: any) => {
      if (!n.read) {
        onMarkWorkspaceNotificationRead(n.notificationId);
      }
    });
  };

  const handleClearNotifications = () => {
    localStorage.setItem('sci_workspace_notifications', JSON.stringify([]));
    window.location.reload();
  };

  return (
    <NotificationsView
      notifications={mappedNotifications}
      onMarkAllRead={handleMarkAllRead}
      onClearNotifications={handleClearNotifications}
      onToggleRead={(id) => onMarkWorkspaceNotificationRead(id)}
    />
  );
}

function AuditRoute() {
  const { 
    workspaceAuditEvents, 
    searchQuery, 
    selectedAuditActor, 
    setSelectedAuditActor,
    onClearWorkspaceAuditEvents
  } = useLifecycle();

  // Map SCIWorkspaceAuditEvent to AuditLog
  const mappedLogs = React.useMemo(() => {
    return workspaceAuditEvents.map((e: any) => ({
      id: e.auditId,
      timestamp: e.createdAt,
      actor: e.actorName,
      action: e.action,
      target: e.targetId ? `${e.targetType.toUpperCase()}: ${e.targetId}` : e.targetType.toUpperCase(),
      status: (e.result === 'success' ? 'Success' : e.result === 'warning' ? 'Warning' : 'Failed') as any
    }));
  }, [workspaceAuditEvents]);

  return (
    <div className="space-y-4">
      {workspaceAuditEvents.length > 0 && (
        <div className="flex justify-end pr-2">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear all compliance audit logs?")) {
                onClearWorkspaceAuditEvents();
              }
            }}
            className="border border-red-650 text-red-650 hover:bg-red-650 hover:text-white px-3 py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            FLUSH AUDIT SEAL
          </button>
        </div>
      )}
      <AuditLogsView
        logs={mappedLogs}
        searchQuery={searchQuery}
        onActorFilter={setSelectedAuditActor}
        selectedActor={selectedAuditActor}
      />
    </div>
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

function StaffManagementRoute() {
  const { 
    internalStaff, 
    setInternalStaff, 
    staffRoles, 
    staffDesks, 
    internalMenuFeatures,
    activeStaffSession, 
    setActiveStaffSession 
  } = useLifecycle();

  const currentStaffCanCreateEmployee = useMemo(() => {
    if (!activeStaffSession) return false;
    const staff = internalStaff.find(s => s.staffId === activeStaffSession.staffId);
    if (!staff) return false;
    const role = staffRoles.find(r => r.roleId === staff.roleId);
    return staff.canCreateEmployee || (role ? role.canCreateEmployee : false);
  }, [activeStaffSession, internalStaff, staffRoles]);

  const handleSimulateSession = (staffId: string) => {
    const staff = internalStaff.find(s => s.staffId === staffId);
    if (!staff) return;
    const role = staffRoles.find(r => r.roleId === staff.roleId);
    const desk = staffDesks.find(d => d.deskId === staff.defaultDeskId) || staffDesks[0];
    if (staff && role && desk) {
      const session = createStaffSession({ staff, role, desk });
      setActiveStaffSession(session);
    }
  };

  return (
    <StaffManagementView
      internalStaff={internalStaff}
      onUpdateInternalStaff={setInternalStaff}
      staffRoles={staffRoles}
      staffDesks={staffDesks}
      menuFeatures={internalMenuFeatures}
      activeStaffSession={activeStaffSession}
      onUpdateStaffSession={setActiveStaffSession}
      currentStaffCanCreateEmployee={currentStaffCanCreateEmployee}
      onSimulateSession={handleSimulateSession}
    />
  );
}

function StaffRolesRoute() {
  const { staffRoles, setStaffRoles, internalMenuFeatures, currentAdmin } = useLifecycle();
  return (
    <StaffRoleCreatorView
      staffRoles={staffRoles}
      onUpdateStaffRoles={setStaffRoles}
      menuFeatures={internalMenuFeatures}
      currentAdmin={currentAdmin}
    />
  );
}

function StaffDesksRoute() {
  const { staffDesks, setStaffDesks, internalStaff, internalMenuFeatures, currentAdmin } = useLifecycle();
  return (
    <StaffDeskCreatorView
      staffDesks={staffDesks}
      onUpdateStaffDesks={setStaffDesks}
      internalStaff={internalStaff}
      menuFeatures={internalMenuFeatures}
      currentAdmin={currentAdmin}
    />
  );
}

function MenuFeaturesRoute() {
  const { internalMenuFeatures, setInternalMenuFeatures, staffRoles, staffDesks, currentAdmin } = useLifecycle();
  return (
    <MenuFeaturesView
      menuFeatures={internalMenuFeatures}
      onUpdateMenuFeatures={setInternalMenuFeatures}
      staffRoles={staffRoles}
      staffDesks={staffDesks}
      currentAdmin={currentAdmin}
    />
  );
}

function CapacityRoute() {
  const { plans, posLicenses, rpnAgents } = useLifecycle();
  return (
    <CapacityView
      plans={plans}
      posLicenses={posLicenses}
      rpnAgents={rpnAgents}
    />
  );
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
