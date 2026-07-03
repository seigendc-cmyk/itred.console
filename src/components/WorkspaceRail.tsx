import React from 'react';
import { SCIWorkspace, SCI_WORKSPACES } from '../workspace/workspaceTypes';
import { resolveWorkspaceAccess } from '../workspace/workspaceAccess';
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
  
  // Resolve access status for all workspaces
  const workspaceAccessMap = React.useMemo(() => {
    const map: Record<string, boolean> = {};
    SCI_WORKSPACES.forEach((ws) => {
      map[ws.workspaceId] = resolveWorkspaceAccess({
        workspace: ws,
        session: activeStaffSession
      }).allowed;
    });
    return map;
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
        {SCI_WORKSPACES.map((ws) => {
          const isActive = activeWorkspaceId === ws.workspaceId;
          const isAllowed = workspaceAccessMap[ws.workspaceId];
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
              title={`${ws.label} - ${ws.description}${!isAllowed ? ' (Clearance Required)' : ''}`}
            >
              {/* Workspace Badge name */}
              <span className="text-[9px] uppercase font-black tracking-widest leading-none">{ws.iconLabel}</span>
              
              {/* Lock Indicator for Restricted Workspaces */}
              {!isAllowed && (
                <span className="absolute top-1 right-1 text-[7px] text-[#FF5A00] font-black leading-none select-none">
                  🔒
                </span>
              )}
              
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
