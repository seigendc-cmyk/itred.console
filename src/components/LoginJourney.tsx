import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  UserCheck, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Loader2,
  Lock,
  Compass,
  ArrowRightLeft,
  Sparkles,
  Plus,
  Briefcase
} from 'lucide-react';
import { MOCK_COMPANIES, MOCK_ADMINS } from '../data';
import { LifecycleStepper } from './LifecycleWizard';
import { useLifecycle } from '../App';

/* ==========================================================================
   PHASE 1: GOOGLE LOGIN
   ========================================================================== */
interface GoogleLoginViewProps {
  onLogin: (email: string) => void;
}

export function GoogleLoginView({ onLogin }: GoogleLoginViewProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('seigendc@gmail.com');

  const handleGoogleLogin = () => {
    setLoading(true);
    // Simulate beautiful OAuth delay
    setTimeout(() => {
      setLoading(false);
      onLogin(customEmail);
      navigate('/company-selector');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F1] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border-4 border-[#1A1A1A] p-8 shadow-2xl relative">
        {/* Accent corner bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />

        <div className="text-center space-y-3 mb-8 pt-2">
          {/* Mock Google Logo with custom SVG styling */}
          <div className="flex justify-center items-center space-x-1.5 mb-2 select-none">
            <span className="text-2xl font-black tracking-tight font-sans text-blue-600">G</span>
            <span className="text-2xl font-black tracking-tight font-sans text-red-500">o</span>
            <span className="text-2xl font-black tracking-tight font-sans text-yellow-500">o</span>
            <span className="text-2xl font-black tracking-tight font-sans text-blue-600">g</span>
            <span className="text-2xl font-black tracking-tight font-sans text-green-500">l</span>
            <span className="text-2xl font-black tracking-tight font-sans text-red-500">e</span>
          </div>
          <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wider font-sans">
            Account Single Sign-On
          </h2>
          <p className="text-xs text-gray-500 font-sans max-w-xs mx-auto leading-relaxed">
            Authorized entry gateway to the iTred Commerce & Terminal Management Suite.
          </p>
        </div>

        <div className="space-y-5 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-gray-500 uppercase text-[10px] block font-bold">PREFILLED ACCOUNT EMAIL</label>
            <div className="relative">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#D1D1CF] p-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5A00] font-semibold lowercase rounded-none pl-9"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] py-3 uppercase font-bold text-center tracking-wider transition-all rounded-none cursor-pointer flex items-center justify-center space-x-3 text-xs shadow-md active:translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FF5A00]" />
                <span className="font-sans">COMMUNICATING WITH GOOGLE AUTH...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.514 5.514 0 0 1 8.5 13a5.514 5.514 0 0 1 5.491-5.514c2.26 0 3.869 1.007 4.731 1.83l3.245-3.243C19.92 4.155 17.14 2.5 14 2.5a10.5 10.5 0 0 0-10.5 10.5A10.5 10.5 0 0 0 14 23.5c5.77 0 10.5-4.145 10.5-10.5 0-.71-.06-1.4-.18-2.065H12.24Z"
                  />
                </svg>
                <span className="font-sans">SIGN IN WITH GOOGLE</span>
              </>
            )}
          </button>

          <div className="bg-orange-50 border border-orange-200 text-[#1A1A1A] p-4 text-[11px] leading-relaxed font-sans">
            <strong>PROTOTYPE MODE:</strong> No actual passwords are required. Logging in initializes the guided user journey simulation for the vendor lifecycle.
          </div>
        </div>

        {/* Footer info decoration */}
        <div className="mt-8 border-t border-[#D1D1CF] pt-4 text-center font-mono text-[9px] text-gray-400 uppercase tracking-widest flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#FF5A00]" /> SECURE CHANNEL
          </span>
          <span>BUILD v4.14-stable</span>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================================
   PHASE 2: COMPANY SELECTOR
   ========================================================================== */
const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

interface CompanySelectorViewProps {
  onSelectCompany: (company: string) => void;
  selectedCompany: string | null;
}

export function CompanySelectorView({ onSelectCompany, selectedCompany }: CompanySelectorViewProps) {
  const navigate = useNavigate();
  const { googleEmail, vendors, setVendors, addLogAndNotify, rpnAgents, setRpnAgents } = useLifecycle();

  const [isAddingBiz, setIsAddingBiz] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  
  // Category states
  const [selectedCategory, setSelectedCategory] = useState('Grocery & Hypermarket');
  const [customCategory, setCustomCategory] = useState('');
  
  // City and Country states
  const [selectedCity, setSelectedCity] = useState('London');
  const [customCity, setCustomCity] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('United Kingdom');

  // RPN routing states
  const [selectedRpnId, setSelectedRpnId] = useState('');

  const handleCompanySelect = (company: string) => {
    onSelectCompany(company);
    // Auto-navigate to staff selection
    navigate('/staff-access');
  };

  // Find dynamic vendors associated with logged-in email
  const linkedBusinesses = vendors.filter(
    (v: any) => (v.email || '').toLowerCase() === (googleEmail || '').toLowerCase()
  );

  const handleRegisterBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    const finalCategory = selectedCategory === '__CUSTOM__' ? customCategory.trim() : selectedCategory;
    const finalCity = selectedCity === '__CUSTOM__' ? customCity.trim() : selectedCity;
    const finalLocation = `${finalCity}, ${selectedCountry}`;

    if (!finalCategory) {
      alert("Please specify a business category.");
      return;
    }
    if (!finalCity) {
      alert("Please specify a city.");
      return;
    }

    const newId = `V-${Math.floor(100 + Math.random() * 900)}`;
    const newCode = `${newBizName.substring(0, 3).toUpperCase()}-${newId.split('-')[1]}`;
    
    const rpnNode = rpnAgents?.find((agent: any) => agent.id === selectedRpnId);

    const newVendor = {
      id: newId,
      name: newBizName,
      category: finalCategory,
      status: 'Active',
      email: googleEmail,
      code: newCode,
      joinedDate: new Date().toISOString().split('T')[0],
      location: finalLocation,
      linkedRpnId: rpnNode ? rpnNode.id : undefined,
      linkedRpnName: rpnNode ? rpnNode.name : undefined
    };

    setVendors([newVendor, ...vendors]);

    if (rpnNode && setRpnAgents && rpnAgents) {
      setRpnAgents(rpnAgents.map((agent: any) => {
        if (agent.id === rpnNode.id) {
          const currentLinked = agent.linkedVendorIds || [];
          return {
            ...agent,
            linkedVendorIds: [...currentLinked, newId]
          };
        }
        return agent;
      }));
    }

    addLogAndNotify(
      'System',
      'VENDOR_REGISTRATION',
      newBizName,
      'Success',
      'success',
      'Multi-Business Linked',
      `Linked second business "${newBizName}" to Google Mail "${googleEmail}"${rpnNode ? ` routed via RPN node "${rpnNode.name}"` : ''}.`
    );

    // Auto-select and proceed!
    onSelectCompany(newBizName);
    setNewBizName('');
    setSelectedCategory('Grocery & Hypermarket');
    setCustomCategory('');
    setSelectedCity('London');
    setCustomCity('');
    setSelectedCountry('United Kingdom');
    setSelectedRpnId('');
    setIsAddingBiz(false);
    navigate('/staff-access');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F1] flex flex-col justify-center items-center p-4 space-y-6">
      <div className="w-full max-w-lg bg-white border-4 border-[#1A1A1A] p-8 shadow-2xl relative">
        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />

        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-1 text-[#FF5A00]">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wider font-sans">
            SELECT ACTIVE OPERATIONS CONSOLE
          </h2>
          <div className="bg-[#F4F4F1] border border-[#D1D1CF] p-2 inline-flex items-center space-x-2 font-mono text-[10px] text-gray-500 uppercase rounded-none max-w-md">
            <span className="font-bold text-[#FF5A00]">ACTIVE GOOGLE MAIL:</span>
            <span className="lowercase font-semibold text-[#1A1A1A]">{googleEmail}</span>
          </div>
        </div>

        <div className="space-y-4 font-mono text-xs">
          
          {/* Section A: Multi-Business tenants linked to this account */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-[#D1D1CF] pb-1 flex justify-between items-center">
              <span>GOOGLE ACCOUNT REGISTERED BUSINESSES ({linkedBusinesses.length})</span>
              <span className="text-[9px] text-[#FF5A00] lowercase font-normal">multi-tenant enabled</span>
            </div>
            
            {linkedBusinesses.length === 0 ? (
              <div className="p-4 text-center border-2 border-dashed border-[#D1D1CF] text-gray-400 italic">
                No businesses registered under {googleEmail} yet.
              </div>
            ) : (
              <div className="space-y-2">
                {linkedBusinesses.map((biz) => {
                  const isSelected = biz.name === selectedCompany;
                  return (
                    <button
                      key={biz.id}
                      onClick={() => handleCompanySelect(biz.name)}
                      className={`w-full p-4 border-2 text-left transition-all rounded-none flex justify-between items-center group cursor-pointer ${
                        isSelected 
                          ? 'border-[#FF5A00] bg-orange-50/20 text-[#1A1A1A]' 
                          : 'border-[#D1D1CF] bg-white hover:border-[#1A1A1A] hover:bg-[#F4F4F1] text-gray-700 hover:text-black'
                      }`}
                    >
                      <div>
                        <div className="font-bold uppercase text-[#1A1A1A]">{biz.name}</div>
                        <div className="text-[9px] text-gray-400 font-sans uppercase tracking-tight mt-0.5">
                          ID: {biz.id} • {biz.category} • {biz.location}
                        </div>
                      </div>
                      <ChevronRightIcon className={`w-4 h-4 transition-all shrink-0 ${
                        isSelected ? 'text-[#FF5A00]' : 'text-gray-400 group-hover:translate-x-1'
                      }`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inline "Register another business under same Google account" UI */}
          <div className="border border-[#D1D1CF] bg-[#F4F4F1] p-4">
            {!isAddingBiz ? (
              <button
                onClick={() => setIsAddingBiz(true)}
                className="w-full border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white p-2 text-center uppercase font-bold tracking-wider cursor-pointer text-[10px] transition-all bg-white"
              >
                + Link Another Business To This Account
              </button>
            ) : (
              <form onSubmit={handleRegisterBusiness} className="space-y-3">
                <div className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Register second business under {googleEmail}</span>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase">BUSINESS NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Coffee Shop"
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    className="w-full bg-white border border-[#D1D1CF] p-2 text-xs focus:outline-none focus:border-[#FF5A00] uppercase font-bold"
                  />
                </div>

                <div className="space-y-3">
                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-400 uppercase">BUSINESS CATEGORY</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-white border border-[#D1D1CF] p-2 text-xs focus:outline-none uppercase font-bold"
                    >
                      <option value="Grocery & Hypermarket">Grocery & Hypermarket</option>
                      <option value="Convenience Stores">Convenience Stores</option>
                      <option value="General Goods">General Goods</option>
                      <option value="Apparel & Footwear">Apparel & Footwear</option>
                      <option value="Fuel & Convenience">Fuel & Convenience</option>
                      <option value="__CUSTOM__">+ Add custom category...</option>
                    </select>

                    {selectedCategory === '__CUSTOM__' && (
                      <div className="mt-1">
                        <input
                          type="text"
                          required
                          placeholder="Type Custom Category Name"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full bg-white border border-[#FF5A00] p-2 text-xs focus:outline-none uppercase font-bold"
                        />
                      </div>
                    )}
                  </div>

                  {/* City and Country Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* City field with custom option */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-400 uppercase">CITY</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-white border border-[#D1D1CF] p-2 text-xs focus:outline-none uppercase font-bold"
                      >
                        <option value="London">London</option>
                        <option value="New York">New York</option>
                        <option value="Frankfurt">Frankfurt</option>
                        <option value="Tokyo">Tokyo</option>
                        <option value="Milan">Milan</option>
                        <option value="Calgary">Calgary</option>
                        <option value="Sydney">Sydney</option>
                        <option value="Paris">Paris</option>
                        <option value="Berlin">Berlin</option>
                        <option value="__CUSTOM__">+ Add custom city...</option>
                      </select>

                      {selectedCity === '__CUSTOM__' && (
                        <div className="mt-1">
                          <input
                            type="text"
                            required
                            placeholder="Type Custom City Name"
                            value={customCity}
                            onChange={(e) => setCustomCity(e.target.value)}
                            className="w-full bg-white border border-[#FF5A00] p-2 text-xs focus:outline-none uppercase font-bold"
                          />
                        </div>
                      )}
                    </div>

                    {/* Country List - All Countries */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-400 uppercase">COUNTRY</label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full bg-white border border-[#D1D1CF] p-2 text-xs focus:outline-none font-bold"
                      >
                        {ALL_COUNTRIES.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* RPN Routing Node Assignment Field */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-400 uppercase">RPN AGENCY ROUTING (RELAY NODE)</label>
                    <select
                      value={selectedRpnId}
                      onChange={(e) => setSelectedRpnId(e.target.value)}
                      className="w-full bg-white border border-[#D1D1CF] p-2 text-xs focus:outline-none uppercase font-bold"
                    >
                      <option value="">Direct / Standalone Routing (No RPN)</option>
                      {rpnAgents && rpnAgents.map((agent: any) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} ({agent.region}) — {agent.connectionStatus}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#1A1A1A] hover:bg-[#FF5A00] text-white p-2 uppercase font-bold text-[10px] cursor-pointer"
                  >
                    Create & Select
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingBiz(false);
                      setSelectedCategory('Grocery & Hypermarket');
                      setCustomCategory('');
                      setSelectedCity('London');
                      setCustomCity('');
                      setSelectedCountry('United Kingdom');
                    }}
                    className="border border-[#D1D1CF] bg-white hover:bg-gray-100 text-gray-600 p-2 uppercase text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section B: Default Corporate Platform Nodes */}
          <div className="space-y-2 pt-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-[#D1D1CF] pb-1">
              SYSTEM CONSOLE OPERATOR NODES
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOCK_COMPANIES.map((company) => {
                const isSelected = company === selectedCompany;
                return (
                  <button
                    key={company}
                    onClick={() => handleCompanySelect(company)}
                    className={`p-2.5 border text-left uppercase font-bold tracking-wide transition-all rounded-none text-[10px] truncate cursor-pointer ${
                      isSelected 
                        ? 'border-[#FF5A00] bg-orange-50/20 text-[#1A1A1A]' 
                        : 'border-[#D1D1CF] bg-white hover:border-[#1A1A1A] text-gray-600 hover:text-black'
                    }`}
                  >
                    {company}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Action Link Back */}
        <div className="mt-6 pt-4 border-t border-[#D1D1CF] flex justify-between items-center text-xs">
          <Link to="/login" className="text-gray-400 hover:text-black font-sans font-semibold uppercase flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 rotate-180 text-gray-400" />
            <span>Back to Auth</span>
          </Link>
          <span className="text-[10px] text-gray-400 font-mono">PHASE 2 OF 11</span>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================================
   PHASE 3: STAFF ACCESS SELECTOR
   ========================================================================== */
interface StaffAccessViewProps {
  onSelectAdmin: (admin: typeof MOCK_ADMINS[0]) => void;
  selectedAdmin: typeof MOCK_ADMINS[0];
}

export function StaffAccessView({ onSelectAdmin, selectedAdmin }: StaffAccessViewProps) {
  const navigate = useNavigate();

  const handleAdminSelect = (admin: typeof MOCK_ADMINS[0]) => {
    onSelectAdmin(admin);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F1] flex flex-col justify-center items-center p-4 space-y-6">
      <div className="w-full max-w-lg bg-white border-4 border-[#1A1A1A] p-8 shadow-2xl relative">
        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF5A00]" />

        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-1 text-[#FF5A00]">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold uppercase text-[#1A1A1A] tracking-wider font-sans">
            DELEGATED STAFF CREDENTIALS
          </h2>
          <p className="text-xs text-gray-500 font-sans max-w-xs mx-auto leading-relaxed">
            Select an administrative security key profile to sign telemetry transactions.
          </p>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {MOCK_ADMINS.map((admin) => {
            const isSelected = admin.name === selectedAdmin.name;
            return (
              <button
                key={admin.name}
                onClick={() => handleAdminSelect(admin)}
                className={`w-full p-4 border-2 text-left transition-all rounded-none flex justify-between items-center group cursor-pointer ${
                  isSelected 
                    ? 'border-[#FF5A00] bg-orange-50/20' 
                    : 'border-[#D1D1CF] bg-white hover:border-[#1A1A1A] hover:bg-[#F4F4F1]'
                }`}
              >
                <div>
                  <div className="font-bold text-[#1A1A1A] uppercase text-xs">{admin.name}</div>
                  <div className="text-[10px] text-gray-400 uppercase mt-0.5 font-sans">
                    {admin.role} • {admin.email}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase ${
                    admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {admin.status}
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Link Back */}
        <div className="mt-6 pt-4 border-t border-[#D1D1CF] flex justify-between items-center text-xs">
          <Link to="/company-selector" className="text-gray-400 hover:text-black font-sans font-semibold uppercase flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 rotate-180 text-gray-400" />
            <span>Change Company</span>
          </Link>
          <span className="text-[10px] text-gray-400 font-mono">PHASE 3 OF 11</span>
        </div>
      </div>
    </div>
  );
}

// Simple internal icon to prevent module issues
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
