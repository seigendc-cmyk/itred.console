import React from 'react';
import { SCIWorkspace, SCI_WORKSPACES } from '../workspace/workspaceTypes';
import { getAccessibleWorkspaces } from '../workspace/workspaceAccess';
import { SCIStaffSession } from '../internal/staffTypes';

interface WorkspaceRailProps {
  activeWorkspaceId: string;
  onWorkspaceSelect: (path: string) => void;
  activeStaffSession: SCIStaffSession | null;
}

export default function WorkspaceRail({ 
  activeWorkspaceId, 
  onWorkspaceSelect,
  activeStaffSession 
}: WorkspaceRailProps) {
  
  // Filter active workspaces based on active desk console capabilities
  const allowedWorkspaces = React.useMemo(() => {
    return getAccessibleWorkspaces({
      workspaces: SCI_WORKSPACES,
      session: activeStaffSession
    });
  }, [activeStaffSession]);

  return (
    <div id="workspace_rail" className="w-16 bg-[#111111] border-r border-[#222222] flex flex-col items-center py-4 space-y-3 shrink-0 relative z-20 font-mono select-none">
      
      {/* Brand Icon */}
      <div className="w-9 h-9 bg-[#FF5A00] flex items-center justify-center font-bold text-white text-xs mb-3 shadow-md">
        SCI
      </div>
      
      <div className="w-full border-t border-[#222222] my-2" />

      {/* Workspace triggers */}
      <div className="flex-1 w-full space-y-2 flex flex-col items-center">
        {allowedWorkspaces.map((ws) => {
          const isActive = activeWorkspaceId === ws.workspaceId;
          return (
            <button
              id={`workspace_rail_btn_${ws.workspaceId}`}
              key={ws.workspaceId}
              onClick={() => onWorkspaceSelect(ws.defaultPath)}
              className={`w-11 h-11 flex flex-col justify-center items-center border transition-all rounded-none cursor-pointer relative ${
                isActive 
                  ? 'bg-[#FF5A00] border-transparent text-white font-black' 
                  : 'bg-[#222222] border-transparent text-[#8E9299] hover:text-white hover:bg-[#333333]'
              }`}
              title={`${ws.label} - ${ws.description}`}
            >
              {/* Workspace Badge name */}
              <span className="text-[9px] uppercase font-black tracking-widest leading-none">{ws.iconLabel}</span>
              
              {/* Active Indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Technical version label */}
      <div className="text-[7px] text-[#444444] uppercase tracking-widest text-center mt-auto font-mono">
        V4.14
      </div>

    </div>
  );
}
