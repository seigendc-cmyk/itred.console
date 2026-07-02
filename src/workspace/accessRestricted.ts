export interface AccessRestrictedViewModel {
  title: string;
  message: string;
  reasonCode?: string;
  activeDesk?: string;
  requiredFeatureIds?: string[];
  grantedFeatureIds?: string[];
}

export function buildAccessRestrictedViewModel(input: {
  reasonCode?: string;
  activeDesk?: string;
  requiredFeatureIds?: string[];
  grantedFeatureIds?: string[];
}): AccessRestrictedViewModel {
  return {
    title: "Access Restricted",
    message:
      "This desk does not have access to the requested workspace or menu feature.",
    reasonCode: input.reasonCode,
    activeDesk: input.activeDesk,
    requiredFeatureIds: input.requiredFeatureIds ?? [],
    grantedFeatureIds: input.grantedFeatureIds ?? [],
  };
}
