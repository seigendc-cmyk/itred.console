import React, { useState } from 'react';
import { useLifecycle } from '../App';
import { Vendor, Plan, RPNAgent } from '../types';

const ALL_COUNTRIES = [
  "United States", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];
import { 
  Building, 
  FileText, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Plus, 
  Sliders, 
  Bookmark, 
  ArrowRight, 
  RotateCcw,
  ShieldAlert,
  Cpu,
  Trash2,
  Edit,
  ChevronDown
} from 'lucide-react';

interface VendorManagementViewProps {
  vendors: Vendor[];
  searchQuery: string;
  onAddVendorClick: () => void;
  onUpdateVendorStatus: (vendorId: string, status: Vendor['status']) => void;
  onDeleteVendor: (vendorId: string) => void;
}

export default function VendorManagementView({
  vendors: propsVendors,
  searchQuery: propsSearchQuery,
  onAddVendorClick,
  onUpdateVendorStatus,
  onDeleteVendor
}: VendorManagementViewProps) {
  
  const { 
    vendors, 
    setVendors, 
    plans, 
    currentAdmin, 
    addLogAndNotify,
    posLicenses,
    setPosLicenses,
    rpnAgents,
    setRpnAgents
  } = useLifecycle();

  // Active workspace section tab
  const [activeTab, setActiveTab] = useState<'directory' | 'register' | 'admin' | 'pending-view' | 'demo-vendors'>('directory');

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [category, setCategory] = useState('Grocery & Hypermarket');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('Boston');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedApps, setSelectedApps] = useState<string[]>(['StockSync Core']);

  // Custom Category & City States
  const [categories, setCategories] = useState<string[]>([
    'Grocery & Hypermarket',
    'Convenience Stores',
    'General Goods',
    'Apparel & Footwear',
    'Fuel & Convenience',
    'Building Materials'
  ]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryVal, setNewCategoryVal] = useState('');

  const [cities, setCities] = useState<string[]>([
    'Boston', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Seattle', 'Miami', 'London', 'Milan', 'Tokyo'
  ]);
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [newCityVal, setNewCityVal] = useState('');

  // RPN State
  const [selectedRpnId, setSelectedRpnId] = useState('');

  // UI Flow Tracking
  const [lastSubmittedVendorId, setLastSubmittedVendorId] = useState<string | null>(null);
  const [selectedAdminVendorId, setSelectedAdminVendorId] = useState<string>('');
  const [assignedPlanId, setAssignedPlanId] = useState<string>(plans[0]?.id || 'PLN-POS-STARTER');

  // Local search query inside directory
  const [localSearch, setLocalSearch] = useState('');

  // Column Visibility Configurator State
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    idCode: true,
    entityDetails: true,
    category: true,
    locationPhone: true,
    integrations: true,
    complianceStatus: true,
    joinedDate: false,
    licenseKey: false
  });
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  // Edit Vendor State
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editName, setEditName] = useState('');
  const [editTradingName, setEditTradingName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState<Vendor['status']>('Pending Verification');
  const [editApps, setEditApps] = useState<string[]>([]);

  const COLUMN_LABELS: Record<string, string> = {
    idCode: 'Reference ID & Code',
    entityDetails: 'Business Details',
    category: 'Business Category',
    locationPhone: 'Location & Phone',
    integrations: 'Suite Integrations & Plan',
    complianceStatus: 'Compliance Status',
    joinedDate: 'Date Joined',
    licenseKey: 'License Key'
  };

  const startEditingVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditName(vendor.name);
    setEditTradingName(vendor.tradingName || '');
    setEditCategory(vendor.category);
    setEditEmail(vendor.email);
    setEditPhone(vendor.phone || '');
    setEditCountry(vendor.country || (vendor.location && vendor.location.includes(', ') ? vendor.location.split(', ')[1] : 'United States'));
    setEditCity(vendor.city || (vendor.location && vendor.location.includes(', ') ? vendor.location.split(', ')[0] : ''));
    setEditAddress(vendor.address || '');
    setEditStatus(vendor.status);
    setEditApps(vendor.requestedApps || []);
  };

  // Available Apps for Checkbox list
  const AVAILABLE_APPS = [
    { name: 'StockSync Core', description: 'Real-time inventory and supply chain tracking' },
    { name: 'iTred Ledger Pro', description: 'Double-entry cryptographic accounting and tax ledger' },
    { name: 'GeoFence Logistics Beacon', description: 'Advanced freight carrier routing telemetry' },
    { name: 'Terminal Gateway Hub', description: 'Edge device management and telemetry aggregator' }
  ];

  // Submit Handler for Registration Form
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim() || !email.trim() || !city.trim() || !address.trim() || !phone.trim()) {
      alert('Please complete all required fields.');
      return;
    }

    // Generate simulated corporate ID & registration sequence code
    const nextNum = vendors.length + 101;
    const newId = `V-${nextNum}`;
    const codePrefix = businessName.substring(0, 3).toUpperCase().replace(/\s/g, 'X');
    const newCode = `${codePrefix}-${nextNum}`;

    const chosenRpn = rpnAgents?.find((a: RPNAgent) => a.id === selectedRpnId);

    const newVendor: Vendor = {
      id: newId,
      name: businessName,
      tradingName: tradingName.trim() || businessName,
      category,
      country,
      city,
      address,
      phone,
      email,
      code: newCode,
      requestedApps: selectedApps,
      status: 'Pending Verification',
      joinedDate: new Date().toISOString().split('T')[0],
      location: `${city}, ${country}`,
      linkedRpnId: selectedRpnId || undefined,
      linkedRpnName: chosenRpn ? chosenRpn.name : undefined
    };

    // Prepend to global context state
    setVendors((prev: Vendor[]) => [newVendor, ...prev]);
    setLastSubmittedVendorId(newId);
    setSelectedAdminVendorId(newId); // auto-select in admin view later

    // Update RPN Agent globally
    if (selectedRpnId && setRpnAgents) {
      setRpnAgents((prev: RPNAgent[]) => prev.map(agent => {
        if (agent.id === selectedRpnId) {
          const currentLinked = agent.linkedVendorIds || [];
          return {
            ...agent,
            linkedVendorIds: currentLinked.includes(newId) ? currentLinked : [...currentLinked, newId]
          };
        }
        return agent;
      }));
    }
    
    // Create Audit log & Notification packet
    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Registration System',
        'REGISTER_COMPANY',
        `${businessName} (${newId})`,
        'Success',
        'info',
        'Company Registration Submitted',
        `Company "${businessName}" successfully applied. Status set to 'Pending Verification'.`
      );
    }

    // Redirect immediately to the "Pending Verification" display state
    setActiveTab('pending-view');

    // Reset Form Fields
    setBusinessName('');
    setTradingName('');
    setCity('Boston');
    setAddress('');
    setPhone('');
    setEmail('');
    setSelectedApps(['StockSync Core']);
    setSelectedRpnId('');
  };

  // Admin Actions: Approve
  const handleAdminApprove = (vendorId: string) => {
    setVendors((prev: Vendor[]) => 
      prev.map(v => v.id === vendorId ? { ...v, status: 'Approved' } : v)
    );

    const vendor = vendors.find(v => v.id === vendorId);
    if (addLogAndNotify && vendor) {
      addLogAndNotify(
        currentAdmin?.name || 'Admin',
        'APPROVE_COMPANY_REGISTRATION',
        `${vendor.name} (${vendorId})`,
        'Success',
        'success',
        'Registration Approved',
        `Ecosystem clearance granted for "${vendor.name}". Plan and licenses may now be provisioned.`
      );
    }
  };

  // Admin Actions: Reject
  const handleAdminReject = (vendorId: string) => {
    setVendors((prev: Vendor[]) => 
      prev.map(v => v.id === vendorId ? { ...v, status: 'Rejected' } : v)
    );

    const vendor = vendors.find(v => v.id === vendorId);
    if (addLogAndNotify && vendor) {
      addLogAndNotify(
        currentAdmin?.name || 'Admin',
        'REJECT_COMPANY_REGISTRATION',
        `${vendor.name} (${vendorId})`,
        'Warning',
        'alert',
        'Registration Rejected',
        `Application for "${vendor.name}" rejected. Gateway routing access has been terminated.`
      );
    }
  };

  // Admin Actions: Issue License (Ready)
  const handleAdminIssueLicense = (vendorId: string) => {
    const selectedPlan = plans.find(p => p.id === assignedPlanId) || plans[0];
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    // Generate a beautiful, unique license key
    const genHex = () => Math.floor(16**4 + Math.random()*(16**5 - 16**4)).toString(16).toUpperCase().substring(0, 4);
    const key = `SGN-LIC-${genHex()}-${genHex()}-${genHex()}`;

    // Update vendor in database list
    setVendors((prev: Vendor[]) => 
      prev.map(v => v.id === vendorId ? { 
        ...v, 
        status: 'Ready',
        assignedPlanId: selectedPlan.id,
        assignedPlanName: selectedPlan.name,
        licenseKey: key
      } : v)
    );

    // Also register a hardware POS license to demonstrate real continuity
    const posId = `POS-LIC-${Math.floor(1000 + Math.random() * 9000)}`;
    const termId = `TRM-${vendor.name.substring(0, 3).toUpperCase().replace(/\s/g, 'X')}-${Math.floor(100 + Math.random() * 900)}`;
    const newLicense = {
      id: posId,
      vendorName: vendor.name,
      terminalId: termId,
      licenseKey: key,
      status: 'Active' as const,
      issuedAt: new Date().toISOString().split('T')[0],
      planName: selectedPlan.name,
      expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      notes: `Issued during company registration workflow clearance on ${new Date().toISOString().split('T')[0]}.`
    };

    setPosLicenses((prev: any) => [newLicense, ...prev]);

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Admin',
        'ISSUE_COMPANY_LICENSE',
        `${vendor.name} • ${key}`,
        'Success',
        'success',
        'Company Integration Ready',
        `License issued. Status updated to 'Ready' for "${vendor.name}" with plan "${selectedPlan.name}".`
      );
    }
  };

  // Filter vendor list with an advanced multi-word order-independent search engine
  const activeSearchQuery = localSearch || propsSearchQuery;
  const filteredVendors = vendors
    .filter(vendor => vendor.assignedPlanId !== 'VENDOR_DEMO')
    .filter(vendor => {
      const queryWords = activeSearchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (queryWords.length === 0) return true;
    
    // Combine all searchable text fields for the vendor
    const searchableText = [
      vendor.id,
      vendor.name,
      vendor.tradingName || '',
      vendor.category,
      vendor.city || '',
      vendor.country || '',
      vendor.location,
      vendor.email,
      vendor.phone || '',
      vendor.code,
      vendor.status,
      vendor.licenseKey || '',
      vendor.assignedPlanName || '',
      ...(vendor.requestedApps || [])
    ].map(field => field.toLowerCase()).join(' ');

    // The vendor matches if EVERY query word is found somewhere in the combined searchable text
    return queryWords.every(word => searchableText.includes(word));
  });

  // Handle saving the updated vendor profile
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    if (!editName.trim() || !editEmail.trim() || !editCity.trim() || !editAddress.trim() || !editPhone.trim()) {
      alert('Please complete all required fields.');
      return;
    }

    const updatedVendor: Vendor = {
      ...editingVendor,
      name: editName.trim(),
      tradingName: editTradingName.trim() || editName.trim(),
      category: editCategory,
      email: editEmail.trim(),
      phone: editPhone.trim(),
      country: editCountry.trim(),
      city: editCity.trim(),
      address: editAddress.trim(),
      status: editStatus,
      requestedApps: editApps,
      location: `${editCity.trim()}, ${editCountry.trim()}`
    };

    setVendors((prev: Vendor[]) => 
      prev.map(v => v.id === editingVendor.id ? updatedVendor : v)
    );

    if (addLogAndNotify) {
      addLogAndNotify(
        currentAdmin?.name || 'Admin',
        'UPDATE_COMPANY_DETAILS',
        `${updatedVendor.name} (${updatedVendor.id})`,
        'Success',
        'info',
        'Company Profile Updated',
        `Manually updated corporate metadata for "${updatedVendor.name}".`
      );
    }

    setEditingVendor(null);
  };

  // Last submitted vendor reference
  const lastSubmittedVendor = vendors.find(v => v.id === lastSubmittedVendorId);

  // Selected Admin console vendor
  const adminSelectedVendor = vendors.find(v => v.id === selectedAdminVendorId) || filteredVendors.find(v => v.status === 'Pending Verification') || vendors[0];

  return (
    <div id="company_registration_prototype" className="space-y-6">
      
      {/* HEADER SECTION */}
      <div id="registration_workspace_header" className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b-4 border-[#1A1A1A] pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-[#FF5A00]" />
            <h1 className="text-xl font-black font-sans text-[#1A1A1A] uppercase tracking-wider">Company Registration Workspace</h1>
          </div>
          <p className="text-xs text-gray-500 font-mono">ENTERPRISE MERCHANTS ONBOARDING & GATEWAY PROVISIONING</p>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex flex-wrap gap-2">
          <button
            id="tab_active_directory"
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all duration-150 rounded-none cursor-pointer border ${
              activeTab === 'directory' 
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' 
                : 'bg-white text-gray-600 border-[#D1D1CF] hover:bg-gray-100'
            }`}
          >
            Active Directory
          </button>
          
          <button
            id="tab_register_form"
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all duration-150 rounded-none cursor-pointer border flex items-center space-x-1.5 ${
              activeTab === 'register' 
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' 
                : 'bg-white text-gray-600 border-[#D1D1CF] hover:bg-gray-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Company</span>
          </button>

          <button
            id="tab_admin_console"
            onClick={() => {
              setActiveTab('admin');
              // Pre-select the first pending registration if any
              const pending = vendors.find(v => v.status === 'Pending Verification');
              if (pending) setSelectedAdminVendorId(pending.id);
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all duration-150 rounded-none cursor-pointer border flex items-center space-x-1.5 ${
              activeTab === 'admin' 
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' 
                : 'bg-white text-gray-600 border-[#D1D1CF] hover:bg-gray-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Admin Console</span>
            {vendors.filter(v => v.status === 'Pending Verification').length > 0 && (
              <span className="bg-[#FF5A00] text-white text-[9px] px-1 py-0.2 rounded-none ml-1 animate-pulse font-sans">
                {vendors.filter(v => v.status === 'Pending Verification').length}
              </span>
            )}
          </button>

          <button
            id="tab_demo_vendors"
            onClick={() => setActiveTab('demo-vendors')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all duration-150 rounded-none cursor-pointer border flex items-center space-x-1.5 ${
              activeTab === 'demo-vendors' 
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' 
                : 'bg-white text-gray-600 border-[#D1D1CF] hover:bg-gray-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Demo Vendors</span>
          </button>

          {lastSubmittedVendorId && (
            <button
              id="tab_pending_view"
              onClick={() => setActiveTab('pending-view')}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all duration-150 rounded-none cursor-pointer border flex items-center space-x-1.5 ${
                activeTab === 'pending-view' 
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' 
                  : 'bg-white text-gray-600 border-[#D1D1CF] hover:bg-gray-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#FF5A00]" />
              <span>Submission Status</span>
            </button>
          )}
        </div>
      </div>


      {/* ==========================================================================
         A. ACTIVE DIRECTORY VIEW
         ========================================================================== */}
      {activeTab === 'directory' && (
        <div id="workspace_active_directory" className="space-y-6">
          
          {/* SEARCH COMPONENT */}
          <div className="bg-[#EAEAE8] border border-[#D1D1CF] p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="SEARCH ENGINE: QUERY IN ANY ORDER (e.g. 'Ready V-101 Boston')..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-white border border-[#D1D1CF] py-2 pl-9 pr-4 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] rounded-none font-semibold uppercase placeholder:text-gray-400"
                />
              </div>
              
              {/* Dynamic Column Visibility Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFieldSelector(!showFieldSelector)}
                  className="w-full sm:w-auto bg-white border border-[#D1D1CF] px-3.5 py-2 text-xs font-bold uppercase hover:bg-gray-50 text-[#1A1A1A] flex items-center justify-center space-x-1.5 h-full rounded-none cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-gray-500" />
                  <span>Columns ({Object.values(visibleFields).filter(Boolean).length})</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                
                {showFieldSelector && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowFieldSelector(false)} />
                    <div className="absolute right-0 mt-1 w-64 bg-white border-2 border-[#1A1A1A] shadow-xl p-3 z-20 space-y-2">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 pb-1 font-mono">
                        Select Columns to Display
                      </div>
                      <div className="space-y-1">
                        {Object.entries(COLUMN_LABELS).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-2 cursor-pointer select-none py-1 hover:bg-gray-50 px-1 font-mono">
                            <input
                              type="checkbox"
                              checked={visibleFields[key]}
                              onChange={() => {
                                setVisibleFields(prev => ({
                                  ...prev,
                                  [key]: !prev[key]
                                }));
                              }}
                              className="text-[#FF5A00] focus:ring-[#FF5A00] border-gray-300 rounded cursor-pointer"
                            />
                            <span className="text-[11px] font-medium text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 pt-1.5 flex justify-between text-[9px] font-bold font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            const allTrue = Object.keys(visibleFields).reduce((acc, k) => ({ ...acc, [k]: true }), {});
                            setVisibleFields(allTrue);
                          }}
                          className="text-[#FF5A00] hover:underline cursor-pointer"
                        >
                          SELECT ALL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const defaults = {
                              idCode: true,
                              entityDetails: true,
                              category: true,
                              locationPhone: true,
                              integrations: true,
                              complianceStatus: true,
                              joinedDate: false,
                              licenseKey: false
                            };
                            setVisibleFields(defaults);
                          }}
                          className="text-gray-500 hover:underline cursor-pointer"
                        >
                          RESET DEFAULTS
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
              Displaying {filteredVendors.length} of {vendors.filter(v => v.assignedPlanId !== 'VENDOR_DEMO').length} Total Registry Blocks
            </div>
          </div>

          {/* MASTER TABLE GRID */}
          <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
            <div className="p-4 border-b border-[#D1D1CF] bg-[#F4F4F1] flex justify-between items-center text-xs font-mono text-gray-500">
              <span className="uppercase text-[#1A1A1A] font-bold">registered business entities registry</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Live database synced</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-[#EAEAE8] border-b border-[#D1D1CF] text-gray-600 uppercase tracking-wider">
                    {visibleFields.idCode && <th className="p-3">Reference / Code</th>}
                    {visibleFields.entityDetails && <th className="p-3">Business Entity Details</th>}
                    {visibleFields.category && <th className="p-3">Category</th>}
                    {visibleFields.locationPhone && <th className="p-3">Location & Phone</th>}
                    {visibleFields.integrations && <th className="p-3">Integrations</th>}
                    {visibleFields.complianceStatus && <th className="p-3">Compliance Status</th>}
                    {visibleFields.joinedDate && <th className="p-3">Date Joined</th>}
                    {visibleFields.licenseKey && <th className="p-3">License Key</th>}
                    <th className="p-3 text-right">Ledger Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D1CF]">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan={Object.values(visibleFields).filter(Boolean).length + 1} className="p-12 text-center text-gray-400 uppercase font-bold text-xs bg-gray-50">
                        NO COMPANY REGISTRATIONS FOUND MATCHING THE OUTBOUND FILTER
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-[#F9F9F8] transition-colors">
                        
                        {/* ID / CODE */}
                        {visibleFields.idCode && (
                          <td className="p-3 align-middle">
                            <div className="font-bold text-[#1A1A1A] text-sm">{vendor.id}</div>
                            <div className="text-[10px] text-[#FF5A00] font-bold uppercase">{vendor.code}</div>
                          </td>
                        )}

                        {/* BUSINESS DETAILS */}
                        {visibleFields.entityDetails && (
                          <td className="p-3 align-middle font-sans">
                            <div className="font-bold text-[#1A1A1A] text-sm">{vendor.name}</div>
                            {vendor.tradingName && vendor.tradingName !== vendor.name && (
                              <div className="text-xs text-gray-500 font-mono uppercase">Trading: {vendor.tradingName}</div>
                            )}
                            <div className="text-xs text-gray-400 font-mono lowercase mt-0.5">{vendor.email}</div>
                          </td>
                        )}

                        {/* CATEGORY */}
                        {visibleFields.category && (
                          <td className="p-3 align-middle">
                            <span className="bg-orange-50 border border-orange-200 text-[#FF5A00] font-bold px-2 py-0.5 text-[10px] uppercase">
                              {vendor.category}
                            </span>
                          </td>
                        )}

                        {/* LOCATION & PHONE */}
                        {visibleFields.locationPhone && (
                          <td className="p-3 align-middle font-mono">
                            <div className="text-gray-700 font-bold">{vendor.location}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{vendor.phone || 'No phone bind'}</div>
                          </td>
                        )}

                        {/* INTEGRATIONS & APPS */}
                        {visibleFields.integrations && (
                          <td className="p-3 align-middle">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {vendor.requestedApps && vendor.requestedApps.length > 0 ? (
                                vendor.requestedApps.map((app) => (
                                  <span key={app} className="bg-gray-100 text-gray-700 border border-gray-300 text-[8px] font-bold uppercase px-1.5 py-0.2">
                                    {app}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 italic text-[10px]">No Apps Bound</span>
                              )}
                            </div>
                            {vendor.assignedPlanName && (
                              <div className="text-[9px] text-[#FF5A00] font-bold uppercase mt-1">
                                PLAN: {vendor.assignedPlanName}
                              </div>
                            )}
                          </td>
                        )}

                        {/* COMPLIANCE STATUS */}
                        {visibleFields.complianceStatus && (
                          <td className="p-3 align-middle">
                            <span className={`px-2 py-1 font-black text-[9px] uppercase inline-flex items-center border ${
                              vendor.status === 'Ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                              vendor.status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                              vendor.status === 'Pending Verification' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                              vendor.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-300' :
                              vendor.status === 'Active' ? 'bg-green-50 text-green-700 border-green-300' :
                              'bg-gray-50 text-gray-600 border-gray-300'
                            }`}>
                              <span className={`w-1.5 h-1.5 mr-1.5 ${
                                vendor.status === 'Ready' || vendor.status === 'Active' ? 'bg-green-500' :
                                vendor.status === 'Approved' ? 'bg-blue-500' :
                                vendor.status === 'Pending Verification' ? 'bg-yellow-500' :
                                vendor.status === 'Rejected' ? 'bg-red-500' :
                                'bg-gray-500'
                              }`} />
                              {vendor.status}
                            </span>
                          </td>
                        )}

                        {/* DATE JOINED */}
                        {visibleFields.joinedDate && (
                          <td className="p-3 align-middle font-mono text-[11px] text-gray-600">
                            {vendor.joinedDate}
                          </td>
                        )}

                        {/* LICENSE KEY */}
                        {visibleFields.licenseKey && (
                          <td className="p-3 align-middle font-mono text-[11px] font-bold text-gray-700">
                            {vendor.licenseKey ? (
                              <span className="text-[#FF5A00] break-all select-all">{vendor.licenseKey}</span>
                            ) : (
                              <span className="text-gray-400 italic text-[10px]">None Issued</span>
                            )}
                          </td>
                        )}

                        {/* ACTIONS / CONTROLS */}
                        <td className="p-3 align-middle text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {vendor.status === 'Pending Verification' && (
                              <button
                                onClick={() => {
                                  setSelectedAdminVendorId(vendor.id);
                                  setActiveTab('admin');
                                }}
                                className="bg-[#FF5A00] hover:bg-black text-white text-[9px] font-mono font-black py-1 px-2.5 uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Clear Registration
                              </button>
                            )}

                            {vendor.status === 'Approved' && (
                              <button
                                onClick={() => {
                                  setSelectedAdminVendorId(vendor.id);
                                  setActiveTab('admin');
                                }}
                                className="bg-[#1A1A1A] hover:bg-[#FF5A00] text-white text-[9px] font-mono font-black py-1 px-2.5 uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Assign Plan / License
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => startEditingVendor(vendor)}
                              className="p-1 border border-gray-300 text-gray-400 hover:text-[#FF5A00] hover:border-[#FF5A00] transition-colors cursor-pointer"
                              title="Edit Corporate details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteVendor(vendor.id)}
                              className="p-1 border border-gray-300 text-gray-400 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
                              title="Delete registration record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ==========================================================================
         B. REGISTRATION FORM VIEW
         ========================================================================== */}
      {activeTab === 'register' && (
        <div id="company_registration_form_panel" className="max-w-2xl mx-auto bg-white border-4 border-[#1A1A1A] p-8 shadow-xl">
          
          <div className="flex items-center space-x-3 border-b border-[#D1D1CF] pb-4 mb-6">
            <Plus className="w-6 h-6 text-[#FF5A00]" />
            <div>
              <h2 className="text-lg font-black uppercase text-[#1A1A1A] tracking-wide">ENTERPRISE REGISTER FORM</h2>
              <p className="text-[10px] text-gray-500 font-mono">ONBOARD NEW BUSINESS ENTITY BLOCK</p>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-5 font-mono text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BUSINESS NAME */}
              <div className="space-y-2">
                <label className="text-[#1A1A1A] font-bold uppercase block">Business Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Orion Prime Distributors"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
                />
              </div>

              {/* TRADING NAME */}
              <div className="space-y-2">
                <label className="text-[#1A1A1A] font-bold uppercase block">Trading Name / DBA</label>
                <input
                  type="text"
                  placeholder="e.g. Orion Logistics"
                  value={tradingName}
                  onChange={(e) => setTradingName(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BUSINESS CATEGORY */}
              <div className="space-y-2">
                <label className="text-[#1A1A1A] font-bold uppercase block">Business Category <span className="text-red-500">*</span></label>
                {!isAddingCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex-1 bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="bg-[#1A1A1A] hover:bg-[#FF5A00] text-white px-3 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                      title="Add Custom Category"
                    >
                      + New
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Custom Category"
                      value={newCategoryVal}
                      onChange={(e) => setNewCategoryVal(e.target.value)}
                      className="flex-1 bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newCategoryVal.trim();
                        if (trimmed) {
                          if (!categories.includes(trimmed)) {
                            setCategories(prev => [...prev, trimmed]);
                          }
                          setCategory(trimmed);
                          setNewCategoryVal('');
                          setIsAddingCategory(false);
                        } else {
                          alert('Please enter a valid category name.');
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 text-xs font-bold uppercase cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryVal('');
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 text-xs font-bold uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* PHONE */}
              <div className="space-y-2">
                <label className="text-[#1A1A1A] font-bold uppercase block">Business Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 (555) 019-2231"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* COUNTRY */}
              <div className="space-y-2">
                <label className="text-[#1A1A1A] font-bold uppercase block">Country <span className="text-red-500">*</span></label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
                >
                  {ALL_COUNTRIES.map(ctry => (
                    <option key={ctry} value={ctry}>{ctry}</option>
                  ))}
                </select>
              </div>

              {/* CITY */}
              <div className="space-y-2">
                <label className="text-[#1A1A1A] font-bold uppercase block">City <span className="text-red-500">*</span></label>
                {!isAddingCity ? (
                  <div className="flex gap-2">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="flex-1 bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
                    >
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddingCity(true)}
                      className="bg-[#1A1A1A] hover:bg-[#FF5A00] text-white px-3 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                      title="Add Custom City"
                    >
                      + New
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Custom City"
                      value={newCityVal}
                      onChange={(e) => setNewCityVal(e.target.value)}
                      className="flex-1 bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newCityVal.trim();
                        if (trimmed) {
                          if (!cities.includes(trimmed)) {
                            setCities(prev => [...prev, trimmed]);
                          }
                          setCity(trimmed);
                          setNewCityVal('');
                          setIsAddingCity(false);
                        } else {
                          alert('Please enter a valid city name.');
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 text-xs font-bold uppercase cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCity(false);
                        setNewCityVal('');
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 text-xs font-bold uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[#1A1A1A] font-bold uppercase block">Contact Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                placeholder="e.g. accounting@orionprime.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold lowercase rounded-none"
              />
            </div>

            {/* RELAY PROCESSING NODE (RPN) LINKING */}
            <div className="space-y-2">
              <label className="text-[#1A1A1A] font-bold uppercase block">Relay Processing Node (RPN) <span className="text-gray-400 font-normal">(Optional)</span></label>
              <select
                value={selectedRpnId}
                onChange={(e) => setSelectedRpnId(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
              >
                <option value="">None — Direct Gateway Connection</option>
                {rpnAgents?.map((agent: RPNAgent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.id} — {agent.name} ({agent.region})
                  </option>
                ))}
              </select>
            </div>

            {/* ADDRESS */}
            <div className="space-y-2">
              <label className="text-[#1A1A1A] font-bold uppercase block">Physical HQ Address <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Suite 404, 21 Beacon Hill Blvd"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold uppercase rounded-none"
              />
            </div>

            {/* REQUESTED APPS */}
            <div className="space-y-3 pt-2">
              <label className="text-[#1A1A1A] font-bold uppercase block">Select Requested Core Applications</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_APPS.map((app) => {
                  const isChecked = selectedApps.includes(app.name);
                  return (
                    <div
                      key={app.name}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedApps(prev => prev.filter(a => a !== app.name));
                        } else {
                          setSelectedApps(prev => [...prev, app.name]);
                        }
                      }}
                      className={`p-3 border cursor-pointer select-none transition-all duration-100 flex items-start space-x-2.5 ${
                        isChecked ? 'border-[#FF5A00] bg-orange-50/10' : 'border-[#D1D1CF] bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 border flex items-center justify-center mt-0.5 shrink-0 ${
                        isChecked ? 'bg-[#FF5A00] border-[#FF5A00] text-white' : 'border-[#D1D1CF]'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3px]" />}
                      </div>
                      <div>
                        <div className="font-bold text-[#1A1A1A] text-[11px] uppercase">{app.name}</div>
                        <p className="text-[9px] text-gray-500 font-sans leading-tight mt-0.5">{app.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ALERT WARNING BINDER */}
            <div className="bg-amber-50 border border-amber-300 p-3 text-[10px] text-[#1A1A1A] leading-relaxed font-sans">
              <strong>REGISTRATION MANDATE:</strong> Submitting places this company in <strong>'Pending Verification'</strong>. Digital ledger routing, keys, and branch databases will remain isolated until a Lead SysOp manually clears the registration from the Admin Console.
            </div>

            {/* SUBMIT */}
            <div className="pt-4 flex space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className="flex-1 bg-white border border-[#D1D1CF] text-gray-700 py-3.5 uppercase font-bold text-center tracking-wide hover:bg-gray-100 transition-all font-sans cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#FF5A00] hover:bg-[#E04F00] text-white py-3.5 uppercase font-bold text-center tracking-wide transition-all font-sans flex items-center justify-center space-x-2 cursor-pointer shadow-lg active:translate-y-0.5"
              >
                <span>SUBMIT APPLICATION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>
      )}


      {/* ==========================================================================
         C. SHOW PENDING VERIFICATION SCREEN (AFTER SUBMIT)
         ========================================================================== */}
      {activeTab === 'pending-view' && lastSubmittedVendor && (
        <div id="registration_pending_display" className="max-w-2xl mx-auto space-y-6">
          
          <div className="bg-white border-4 border-[#1A1A1A] p-8 shadow-xl space-y-6">
            
            {/* ALERT STATUS BLOCK */}
            <div className="flex items-start space-x-4 border-b-2 border-[#FF5A00] pb-6">
              <div className="p-3 bg-amber-50 border border-[#FF5A00] text-[#FF5A00] rounded-none shrink-0 animate-pulse">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="bg-[#FF5A00] text-white px-2 py-0.5 text-[10px] font-mono font-bold uppercase inline-block">
                  Pending Verification
                </div>
                <h2 className="text-xl font-black text-[#1A1A1A] font-sans uppercase tracking-wide">
                  APPLICATION FILED SUCCESSFULLY
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  SECURITY TRANSACTION REFERENCE BIND: {lastSubmittedVendor.id}
                </p>
              </div>
            </div>

            {/* FILED APPLICATION DATA */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-400 uppercase tracking-wider block font-mono text-xs">
                SUBMITTED REGISTRATION METADATA
              </h3>

              <div className="bg-[#F4F4F1] border border-[#D1D1CF] p-5 font-mono text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">BUSINESS NAME</span>
                  <span className="font-bold text-[#1A1A1A] uppercase text-sm font-sans">{lastSubmittedVendor.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">TRADING NAME</span>
                  <span className="font-bold text-[#1A1A1A] uppercase text-sm font-sans">{lastSubmittedVendor.tradingName || 'None'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">BUSINESS CATEGORY</span>
                  <span className="font-bold text-[#1A1A1A] uppercase">{lastSubmittedVendor.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">CONTACT EMAIL</span>
                  <span className="font-bold text-[#1A1A1A] lowercase">{lastSubmittedVendor.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">HQ TELEPHONE PHONE</span>
                  <span className="font-bold text-[#1A1A1A] uppercase">{lastSubmittedVendor.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">GEOGRAPHIC OUTPOST</span>
                  <span className="font-bold text-[#1A1A1A] uppercase">{lastSubmittedVendor.location}</span>
                </div>
                <div className="sm:col-span-2 border-t border-gray-300 pt-3">
                  <span className="text-[10px] text-gray-400 uppercase block">REQUESTED SUITE APPLICATIONS</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {lastSubmittedVendor.requestedApps && lastSubmittedVendor.requestedApps.length > 0 ? (
                      lastSubmittedVendor.requestedApps.map(app => (
                        <span key={app} className="bg-[#1A1A1A] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-none font-mono">
                          {app}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic text-[10px]">No integration modules selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* REAL-TIME TELEMETRY BUFFER SEQUENCE */}
            <div className="space-y-2 font-mono">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">SYSTEM ROUTING DAEMON STATUS</span>
              <div className="bg-gray-950 p-4 text-[#8E9299] text-[10px] space-y-1.5 leading-relaxed border border-[#2A2A2A]">
                <div className="text-amber-500">{"[SEC_INIT]"} isolating new registration block node: {lastSubmittedVendor.id}...</div>
                <div>{"[SEC_COMP]"} mapping registered code prefix {lastSubmittedVendor.code}...</div>
                <div>{"[SEC_AUDI]"} scanning international business databases {"→ PASS"}</div>
                <div>{"[SEC_UPLN]"} checking regional hub gateway location ({lastSubmittedVendor.location}) {"→ APPROVED"}</div>
                <div className="text-[#FF5A00] animate-pulse">{"[SEC_WAIT]"} AWAITING OPERATIONAL OVERRIDE CREDENTIALS IN ADMIN CONSOLE...</div>
              </div>
            </div>

            {/* REDIRECT OPTIONS */}
            <div className="bg-orange-50 border-l-4 border-[#FF5A00] p-4 text-xs text-[#1A1A1A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-sans">
              <div className="space-y-1">
                <span className="font-bold block text-orange-950 uppercase">Ready for manual verification?</span>
                <p className="text-orange-900 text-[11px]">As an administrator, you can instantly override the isolation buffer using the console.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedAdminVendorId(lastSubmittedVendor.id);
                  setActiveTab('admin');
                }}
                className="bg-[#1A1A1A] hover:bg-[#FF5A00] text-white text-[10px] font-mono font-bold py-2 px-4 uppercase tracking-wider transition-colors shrink-0 rounded-none cursor-pointer"
              >
                OPEN ADMIN CONSOLE
              </button>
            </div>

            {/* BACK BUTTON */}
            <button
              onClick={() => setActiveTab('directory')}
              className="w-full bg-white border border-[#D1D1CF] text-gray-600 py-3 uppercase text-xs font-mono font-bold hover:bg-gray-50 transition-colors rounded-none cursor-pointer"
            >
              ← RETURN TO ACTIVE BUSINESS DIRECTORY
            </button>

          </div>
        </div>
      )}


      {/* ==========================================================================
         DEMO VENDORS VIEW
         ========================================================================== */}
      {activeTab === 'demo-vendors' && (
        <div id="workspace_demo_vendors" className="space-y-6">
          <div className="bg-orange-50 border-2 border-[#FF5A00] p-6 text-xs shadow-sm">
            <h3 className="text-sm font-black text-[#FF5A00] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              <span>Local Sandbox: Demo Vendors Directory</span>
            </h3>
            <p className="text-gray-700 leading-relaxed font-sans mb-3">
              These vendors exist purely in your browser's local state sandbox. They do not persist to Firebase, consume active production POS licenses, or sync to any production database.
            </p>
            <div className="flex flex-wrap gap-4 font-mono text-[11px] text-orange-950 bg-orange-100/50 p-3 border border-orange-200">
              <div><strong>Storage Node:</strong> LocalStorage Sandbox</div>
              <div><strong>Status:</strong> Sandbox Active</div>
              <div><strong>Firebase Sync:</strong> Disabled (Local-Only State Bounded)</div>
            </div>
          </div>

          {/* Table of Demo Vendors */}
          <div className="bg-white border-2 border-[#1A1A1A] shadow-sm">
            <div className="p-4 border-b border-[#D1D1CF] bg-gray-50 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-gray-700">LOCAL SANDBOX VENDORS</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-[#1A1A1A] text-white font-mono uppercase text-[10px] tracking-wider border-b border-[#1A1A1A]">
                    <th className="p-3">Reference / Code</th>
                    <th className="p-3">Business Entity Details</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Location & Phone</th>
                    <th className="p-3">Integrations</th>
                    <th className="p-3">Compliance Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D1CF]">
                  {vendors.filter(v => v.assignedPlanId === 'VENDOR_DEMO').length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400 uppercase font-bold text-xs bg-gray-50 font-mono">
                        NO DEMO VENDORS ACTIVE. PLEASE GO TO "PLANS & PRICING" AND START A VENDOR DEMO.
                      </td>
                    </tr>
                  ) : (
                    vendors.filter(v => v.assignedPlanId === 'VENDOR_DEMO').map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-[#F9F9F8] transition-colors bg-orange-50/10">
                        <td className="p-3 align-middle">
                          <div className="font-bold text-[#1A1A1A] text-sm">{vendor.id}</div>
                          <div className="text-[10px] text-[#FF5A00] font-bold uppercase">{vendor.code}</div>
                        </td>
                        <td className="p-3 align-middle font-sans">
                          <div className="font-bold text-[#1A1A1A] text-sm">{vendor.name}</div>
                          {vendor.tradingName && vendor.tradingName !== vendor.name && (
                            <div className="text-xs text-gray-500 font-mono uppercase">Trading: {vendor.tradingName}</div>
                          )}
                          <div className="text-xs text-gray-400 font-mono lowercase mt-0.5">{vendor.email}</div>
                        </td>
                        <td className="p-3 align-middle">
                          <span className="bg-orange-50 border border-orange-200 text-[#FF5A00] font-bold px-2 py-0.5 text-[10px] uppercase">
                            {vendor.category}
                          </span>
                        </td>
                        <td className="p-3 align-middle font-mono">
                          <div className="text-gray-700 font-bold">{vendor.location}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{vendor.phone || 'No phone bind'}</div>
                        </td>
                        <td className="p-3 align-middle">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {['Core POS', 'Basic Inventory', 'Audit Trails'].map((app) => (
                              <span key={app} className="bg-orange-100/50 text-[#FF5A00] border border-orange-200 text-[8px] font-bold uppercase px-1.5 py-0.2">
                                {app}
                              </span>
                            ))}
                          </div>
                          <div className="text-[9px] text-[#FF5A00] font-bold uppercase mt-1">
                            PLAN: {vendor.assignedPlanName}
                          </div>
                        </td>
                        <td className="p-3 align-middle">
                          <span className="px-2 py-1 font-black text-[9px] uppercase inline-flex items-center border bg-emerald-50 text-emerald-700 border-emerald-300">
                            <span className="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full animate-pulse" />
                            {vendor.status}
                          </span>
                        </td>
                        <td className="p-3 align-middle text-right">
                          <span className="text-[10px] font-mono text-gray-400 uppercase italic">
                            Demo Mode Sandboxed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ==========================================================================
         D. ADMIN CONSOLE VIEW (APPROVE, REJECT, ASSIGN PLAN, ISSUE LICENSE)
         ========================================================================== */}
      {activeTab === 'admin' && (
        <div id="registration_admin_console" className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: SELECTION DIRECTORY */}
            <div className="lg:col-span-4 bg-white border-2 border-[#1A1A1A] shadow-sm font-mono text-xs">
              <div className="p-3 bg-[#F4F4F1] border-b border-[#D1D1CF] font-bold text-[#1A1A1A] uppercase tracking-wider">
                Pending & Registrations Queue
              </div>
              
              <div className="max-h-[500px] overflow-y-auto divide-y divide-[#D1D1CF]">
                {vendors.filter(v => v.assignedPlanId !== 'VENDOR_DEMO').map((vendor) => {
                  const isSelected = vendor.id === selectedAdminVendorId;
                  return (
                    <div
                      key={vendor.id}
                      onClick={() => setSelectedAdminVendorId(vendor.id)}
                      className={`p-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-orange-50/20 border-l-4 border-l-[#FF5A00]' 
                          : 'hover:bg-[#F9F9F8] border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-[#1A1A1A] truncate max-w-[150px]">{vendor.name}</span>
                        <span className={`px-1.5 py-0.2 text-[8px] font-black uppercase ${
                          vendor.status === 'Ready' ? 'bg-green-100 text-green-800' :
                          vendor.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                          vendor.status === 'Pending Verification' ? 'bg-yellow-100 text-yellow-800 animate-pulse' :
                          vendor.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {vendor.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>ID: {vendor.id}</span>
                        <span>{vendor.joinedDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: WORKSPACE CONTROL UNIT */}
            <div className="lg:col-span-8 bg-white border-4 border-[#1A1A1A] p-6 shadow-md space-y-6">
              
              {adminSelectedVendor ? (
                <div className="space-y-6">
                  
                  {/* MASTER HEADER CARD */}
                  <div className="border-b border-[#D1D1CF] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h2 className="text-lg font-black text-[#1A1A1A] font-sans uppercase">{adminSelectedVendor.name}</h2>
                      <p className="text-[11px] text-gray-500 font-mono">Reference: {adminSelectedVendor.id} • Registered code: {adminSelectedVendor.code}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEditingVendor(adminSelectedVendor)}
                        className="bg-white border border-[#D1D1CF] hover:border-[#FF5A00] text-gray-600 hover:text-[#FF5A00] px-2.5 py-1 text-[10px] uppercase font-bold flex items-center space-x-1 cursor-pointer transition-colors font-mono"
                      >
                        <Edit className="w-3 h-3 text-[#FF5A00]" />
                        <span>Edit Details</span>
                      </button>
                      <span className={`px-2 py-1 text-xs font-mono font-black uppercase inline-flex items-center border ${
                        adminSelectedVendor.status === 'Ready' ? 'bg-green-50 text-green-700 border-green-300' :
                        adminSelectedVendor.status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                        adminSelectedVendor.status === 'Pending Verification' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                        adminSelectedVendor.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-300' :
                        'bg-gray-50 text-gray-600 border-gray-300'
                      }`}>
                        {adminSelectedVendor.status}
                      </span>
                    </div>
                  </div>

                  {/* DETAILS GRID */}
                  <div className="bg-[#F4F4F1] border border-[#D1D1CF] p-4 font-mono text-xs space-y-3">
                    <h4 className="font-bold text-gray-400 uppercase text-[10px] border-b border-gray-300 pb-1">SUBMITTED CORPORATE PORTFOLIO</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Business / Corp Name</span>
                        <span className="text-gray-900 font-bold">{adminSelectedVendor.name}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Trading / DBA Name</span>
                        <span className="text-gray-900 font-bold">{adminSelectedVendor.tradingName || adminSelectedVendor.name}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Industry Sector</span>
                        <span className="text-gray-900 font-bold">{adminSelectedVendor.category}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Headquarters Location</span>
                        <span className="text-gray-900 font-bold">{adminSelectedVendor.location}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Corporate Contact Email</span>
                        <span className="text-gray-900 font-bold lowercase">{adminSelectedVendor.email}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Contact Telephone Phone</span>
                        <span className="text-gray-900 font-bold">{adminSelectedVendor.phone || 'Not Specified'}</span>
                      </div>
                      <div className="sm:col-span-2 border-t border-gray-200 pt-2.5">
                        <span className="text-[9px] text-gray-400 block uppercase font-bold mb-1">Requested Suite Apps</span>
                        <div className="flex flex-wrap gap-1">
                          {adminSelectedVendor.requestedApps && adminSelectedVendor.requestedApps.length > 0 ? (
                            adminSelectedVendor.requestedApps.map((app) => (
                              <span key={app} className="bg-[#1A1A1A] text-white px-2 py-0.5 text-[9px] uppercase font-bold rounded-none">
                                {app}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">None Selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* ==========================================================
                     STEP 1: APPROVE / REJECT COMPLIANCE CLEARANCE
                     ========================================================== */}
                  {adminSelectedVendor.status === 'Pending Verification' && (
                    <div className="border-2 border-yellow-400 p-4 space-y-3 font-mono text-xs">
                      <div className="flex items-center space-x-2 text-yellow-700 font-bold uppercase">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>STEP 1: COMPLIANCE IDENTITY CLEARANCE</span>
                      </div>
                      <p className="text-gray-600 font-sans leading-relaxed text-[11px]">
                        Review the above submitted details against AML and corporate directories. You must choose to either Approve (grant access to licensing workflow) or Reject (isolate and lock the entity).
                      </p>

                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => handleAdminReject(adminSelectedVendor.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono font-bold py-2.5 uppercase text-center tracking-wider cursor-pointer border-2 border-transparent active:translate-y-0.5"
                        >
                          Reject Application
                        </button>
                        <button
                          onClick={() => handleAdminApprove(adminSelectedVendor.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold py-2.5 uppercase text-center tracking-wider cursor-pointer border-2 border-transparent active:translate-y-0.5 flex items-center justify-center space-x-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Grant</span>
                        </button>
                      </div>
                    </div>
                  )}


                  {/* ==========================================================
                     STEP 2: PLAN ASSIGNMENT & CRYPTO LICENSE KEY
                     ========================================================== */}
                  {adminSelectedVendor.status === 'Approved' && (
                    <div className="border-2 border-blue-400 p-5 space-y-4 font-mono text-xs">
                      <div className="flex items-center space-x-2 text-blue-700 font-bold uppercase">
                        <Layers className="w-4 h-4" />
                        <span>STEP 2: PLAN PROVISIONING & LICENSING</span>
                      </div>
                      
                      <p className="text-gray-600 font-sans text-[11px] leading-relaxed">
                        The company has passed identity audits! Assign their billing tier slab, then click <strong>"Issue License Key"</strong> to generate keys and move them to <strong>"Ready"</strong> status.
                      </p>

                      {/* Select Pricing Slabs */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block">Assigned Billing Plan</label>
                        <select
                          value={assignedPlanId}
                          onChange={(e) => setAssignedPlanId(e.target.value)}
                          className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-blue-500 font-bold uppercase rounded-none"
                        >
                          {plans.map((p: Plan) => (
                            <option key={p.id} value={p.id}>
                              {p.name} - ${p.price}/{p.interval === 'Monthly' ? 'Mo' : 'Yr'} ({p.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Issue Action */}
                      <button
                        onClick={() => handleAdminIssueLicense(adminSelectedVendor.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-mono font-bold uppercase text-center tracking-wider cursor-pointer border-2 border-transparent active:translate-y-0.5 flex items-center justify-center space-x-2"
                      >
                        <Terminal className="w-4 h-4" />
                        <span>ISSUE LICENSE & MARK READY</span>
                      </button>
                    </div>
                  )}


                  {/* ==========================================================
                     READY BLOCK CERTIFICATE
                     ========================================================== */}
                  {adminSelectedVendor.status === 'Ready' && (
                    <div className="border-4 border-dashed border-green-500 bg-green-50/20 p-6 space-y-4 font-mono text-xs relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-green-600 text-white text-[9px] font-mono px-6 py-0.5 rotate-45 translate-x-5 translate-y-2 uppercase font-black">
                        LIVE
                      </div>

                      <div className="flex items-center space-x-2 text-green-700 font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>REGISTRATION SEQUENCE STACK COMPLETE</span>
                      </div>

                      <div className="border-t border-green-200 pt-3 space-y-2 text-[11px]">
                        <div><strong>Ecosystem Tenant ID:</strong> {adminSelectedVendor.id} ({adminSelectedVendor.code})</div>
                        <div><strong>Linked Slab Plan:</strong> {adminSelectedVendor.assignedPlanName || 'Standard Enterprise Core'} (ID: {adminSelectedVendor.assignedPlanId})</div>
                        <div><strong>Active Cryptographic Key:</strong> <span className="text-[#FF5A00] font-bold select-all">{adminSelectedVendor.licenseKey}</span></div>
                        <div className="text-gray-400 text-[10px] mt-1 italic">Issued during administrative audit on {adminSelectedVendor.joinedDate}</div>
                      </div>

                      <div className="bg-white border border-green-300 p-2 text-[10px] text-green-800 leading-relaxed font-sans">
                        <strong>INTEGRATION SUCCESS:</strong> All regional gateway routes are open. Outbound hardware POS node validation loops are synchronized.
                      </div>
                    </div>
                  )}


                  {/* REJECTED STATE BLOCK */}
                  {adminSelectedVendor.status === 'Rejected' && (
                    <div className="border-2 border-red-500 bg-red-50/20 p-4 font-mono text-xs space-y-2">
                      <div className="flex items-center space-x-2 text-red-700 font-bold uppercase">
                        <X className="w-4 h-4 shrink-0" />
                        <span>APPLICATION TERMINATED</span>
                      </div>
                      <p className="text-red-900 font-sans leading-relaxed text-[11px]">
                        This application has been manually rejected by administrative policy. Core routing nodes are instructed to block all inbound transaction packets.
                      </p>
                      
                      <button
                        onClick={() => handleAdminApprove(adminSelectedVendor.id)}
                        className="bg-[#1A1A1A] text-white py-1.5 px-3 uppercase text-[9px] font-bold hover:bg-emerald-600 transition-colors rounded-none cursor-pointer"
                      >
                        Override & Approve Registration
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-12 text-center text-gray-400 font-mono uppercase">
                  No company selected in workspace ledger directory.
                </div>
              )}

            </div>

          </div>

        </div>
      )}


      {/* SYSTEM DIAGNOSTIC FOOTER INFO */}
      <div id="registration_daemon_specification" className="bg-[#1A1A1A] text-white border border-[#2A2A2A] p-5 font-mono text-xs space-y-3">
        <div className="flex items-center space-x-2 text-[#FF5A00] font-black uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>seiGEN ENTERPRISE CREDENTIAL TRUST SPECIFICATION</span>
        </div>
        <p className="text-gray-400 text-[11px] leading-relaxed">
          Each registration block initializes a sandboxed virtual node environment. Transitioning to Approved opens standard OAuth parameters, and Assign Plan connects commercial ledger clearing slabs. The final step "Issue License" triggers cryptographic signing, resulting in a Live Ready status which permits real-time branch database synchronization.
        </p>
      </div>

      {/* EDIT VENDOR MODAL */}
      {editingVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleEditSubmit}
            className="bg-white border-4 border-[#1A1A1A] w-full max-w-2xl shadow-2xl rounded-none relative flex flex-col max-h-[90vh]"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />
            
            <div className="p-6 border-b border-[#D1D1CF] flex justify-between items-center gap-4">
              <div className="space-y-1">
                <span className="bg-[#1A1A1A] text-[#FF5A00] px-2 py-0.5 text-[9px] font-mono font-black uppercase inline-block">
                  SGN-LEDGER PROFILE EDITOR
                </span>
                <h3 className="text-base font-black font-sans text-gray-950 uppercase">
                  Edit Profile: {editingVendor.id}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setEditingVendor(null)}
                className="p-1 text-gray-400 hover:text-[#FF5A00] focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono max-h-[65vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BUSINESS NAME */}
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase font-bold block">Business Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs"
                  />
                </div>

                {/* TRADING NAME */}
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase font-bold block">Trading Name / DBA</label>
                  <input
                    type="text"
                    value={editTradingName}
                    onChange={(e) => setEditTradingName(e.target.value)}
                    className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BUSINESS CATEGORY */}
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase font-bold block">Business Category <span className="text-red-500">*</span></label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs"
                  >
                    <option value="Grocery & Hypermarket">Grocery & Hypermarket</option>
                    <option value="Convenience Stores">Convenience Stores</option>
                    <option value="General Goods">General Goods</option>
                    <option value="Apparel & Footwear">Apparel & Footwear</option>
                    <option value="Fuel & Convenience">Fuel & Convenience</option>
                    <option value="Building Materials">Building Materials</option>
                  </select>
                </div>

                {/* STATUS */}
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase font-bold block">Compliance Status <span className="text-red-500">*</span></label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Vendor['status'])}
                    className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs"
                  >
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Approved">Approved</option>
                    <option value="Ready">Ready</option>
                    <option value="Active">Active</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CONTACT EMAIL */}
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase font-bold block">Contact Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs lowercase"
                  />
                </div>

                {/* BUSINESS PHONE */}
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase font-bold block">Business Phone <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* COUNTRY */}
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase font-bold block">Country <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs"
                  />
                </div>

                {/* CITY */}
                <div className="space-y-1">
                  <label className="text-gray-600 uppercase font-bold block">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs"
                  />
                </div>
              </div>

              {/* HQ ADDRESS */}
              <div className="space-y-1">
                <label className="text-gray-600 uppercase font-bold block">Physical HQ Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-[#F4F4F1] border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-1 focus:ring-[#FF5A00] rounded-none text-xs"
                />
              </div>

              {/* APPS INTEGRATION SELECTION */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <label className="text-gray-600 uppercase font-bold block">Requested Suite Applications</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_APPS.map((app) => {
                    const isChecked = editApps.includes(app.name);
                    return (
                      <label 
                        key={app.name}
                        className={`flex items-start space-x-2.5 p-2 border cursor-pointer select-none transition-all duration-100 ${
                          isChecked ? 'border-[#FF5A00] bg-orange-50/10' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setEditApps(editApps.filter(a => a !== app.name));
                            } else {
                              setEditApps([...editApps, app.name]);
                            }
                          }}
                          className="mt-0.5 text-[#FF5A00] focus:ring-[#FF5A00] border-gray-300 rounded cursor-pointer shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[#1A1A1A] text-[10px] uppercase leading-none">{app.name}</div>
                          <p className="text-[9px] text-gray-500 font-sans leading-tight mt-0.5">{app.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="p-6 bg-gray-50 border-t border-[#D1D1CF] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingVendor(null)}
                className="bg-white border border-gray-300 text-gray-700 px-5 py-2 font-mono font-bold uppercase text-xs rounded-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#FF5A00] hover:bg-[#E04F00] text-white px-7 py-2 font-mono font-bold uppercase text-xs rounded-none cursor-pointer shadow-md transition-all"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
