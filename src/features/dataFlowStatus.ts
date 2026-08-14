export type ExternalDataFlow = {
  service: string;
  approved: boolean;
  transmitting: boolean;
};

export type DataFlowStatus = {
  journalAccess: boolean;
  internalProcessing: boolean;
  external: ExternalDataFlow[];
};

export function createLocalDataFlowStatus(journalAccess: boolean): DataFlowStatus {
  return {
    journalAccess,
    internalProcessing: journalAccess,
    external: [],
  };
}

export function hasExternalApproval(status: DataFlowStatus): boolean {
  return status.external.some((flow) => flow.approved);
}

export function hasActiveTransmission(status: DataFlowStatus): boolean {
  return status.external.some((flow) => flow.transmitting);
}
