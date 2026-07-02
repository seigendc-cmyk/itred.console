import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Sparkles,
  Link2
} from 'lucide-react';
import { LIFECYCLE_STEPS } from './LifecycleWizard';

interface SimulatorControlsProps {
  onResetState: () => void;
  mockVendorId: string;
}

export default function SimulatorControls({ onResetState, mockVendorId }: SimulatorControlsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const currentPath = location.pathname;

  // Find if current route corresponds to a phase
  const currentPhase = LIFECYCLE_STEPS.find(step => {
    if (typeof step.path === 'function') {
      // e.g. path matches "/lifecycle/pending-verification/:id"
      const prefix = step.path(':id').split('/:id')[0];
      return currentPath.startsWith(prefix);
    }
    return step.path === currentPath;
  })?.phase || 0;

  const handleJumpToPhase = (step: typeof LIFECYCLE_STEPS[0]) => {
    if (typeof step.path === 'function') {
      navigate(step.path(mockVendorId));
    } else {
      navigate(step.path);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    onResetState();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <div id="simulator_floating_panel" className="fixed bottom-12 right-6 z-50 font-mono text-xs select-none">
      {/* Trigger Button */}
      <button
        id="simulator_trigger_btn"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1A1A1A] hover:bg-[#FF5A00] text-white border-2 border-white px-4 py-2.5 flex items-center space-x-2 shadow-2xl transition-all cursor-pointer font-bold tracking-wider rounded-none uppercase"
      >
        <Compass className="w-4 h-4 text-[#FF5A00] group-hover:text-white animate-spin-slow" />
        <span>SIMULATOR CONTROLS</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Controls Drawer */}
      {isOpen && (
        <div id="simulator_expanded_panel" className="absolute bottom-12 right-0 w-80 bg-[#1A1A1A] border-4 border-[#1A1A1A] text-white shadow-2xl p-4 space-y-4 rounded-none">
          
          <div className="border-b border-gray-800 pb-2 flex justify-between items-center">
            <div>
              <span className="text-[#FF5A00] font-black uppercase text-[10px] block tracking-widest">
                iTred LIFECYCLE CONTROLLER
              </span>
              <span className="text-[9px] text-gray-500 uppercase">
                Active Phase: {currentPhase ? `${currentPhase}/11` : 'OUTSIDE FLOW'}
              </span>
            </div>
            <button
              onClick={handleReset}
              title="Reset state to factory defaults and restart"
              className="p-1 border border-gray-700 bg-gray-900 hover:bg-[#FF5A00] hover:text-white text-gray-400 transition-all rounded-none cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stepper fast travel map */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest block font-bold mb-1">
              FAST-TRAVEL TO CHRONO-PHASE
            </span>
            {LIFECYCLE_STEPS.map((step) => {
              const isCurrent = step.phase === currentPhase;
              
              return (
                <button
                  key={step.phase}
                  onClick={() => handleJumpToPhase(step)}
                  className={`w-full p-2 text-left flex justify-between items-center transition-all border rounded-none group cursor-pointer ${
                    isCurrent 
                      ? 'bg-[#FF5A00]/20 border-[#FF5A00] text-[#FF5A00]' 
                      : 'bg-gray-900 border-transparent hover:border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold uppercase text-[10px]">
                    Phase {step.phase}: {step.label}
                  </span>
                  <Link2 className="w-3 h-3 text-gray-600 group-hover:text-[#FF5A00] transition-colors" />
                </button>
              );
            })}
          </div>

          <div className="p-3 border border-dashed border-gray-800 bg-[#111111] text-[9px] leading-relaxed text-gray-500 font-sans">
            <strong>GUIDE:</strong> Fast-travel injects or uses a mock vendor ID <strong>({mockVendorId})</strong> in the router params to bypass intermediate inputs and demonstrate the layouts immediately.
          </div>

        </div>
      )}
    </div>
  );
}
