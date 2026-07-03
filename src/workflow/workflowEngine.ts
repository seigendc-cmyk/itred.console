export type SCIWorkflowStatus =
  | "draft"
  | "submitted"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

export type SCIWorkflowType =
  | "vendor_activation"
  | "plan_assignment"
  | "pos_license"
  | "app_license"
  | "staff_creation"
  | "staff_role_change"
  | "desk_assignment"
  | "rpn_registration";

export interface SCIWorkflow {
  workflowId: string;
  workflowType: SCIWorkflowType;
  title: string;
  description: string;

  status: SCIWorkflowStatus;

  requesterId: string;
  requesterName: string;

  approverId?: string;
  approverName?: string;

  targetId?: string;
  targetType?: string;

  currentStep: number;
  totalSteps: number;

  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "sci_workflows";

export function getWorkflows(): SCIWorkflow[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw) as SCIWorkflow[];
  } catch {
    return [];
  }
}

export function saveWorkflows(workflows: SCIWorkflow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function addWorkflow(
  workflow: Omit<SCIWorkflow, "workflowId" | "createdAt" | "updatedAt">
) {
  const next: SCIWorkflow = {
    ...workflow,
    workflowId: `wf_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const all = [next, ...getWorkflows()];

  saveWorkflows(all);

  return next;
}

export function updateWorkflow(
  workflowId: string,
  updates: Partial<SCIWorkflow>
) {
  const next = getWorkflows().map((workflow) =>
    workflow.workflowId === workflowId
      ? {
          ...workflow,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : workflow
  );

  saveWorkflows(next);

  return next.find((workflow) => workflow.workflowId === workflowId);
}
