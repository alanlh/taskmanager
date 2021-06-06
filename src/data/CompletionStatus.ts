const CompletionStatusType = "CompletionStatus";
export {CompletionStatusType};

export enum CompletionStatus {
  Planned,
  InProgress,
  Completed,
  Void,
}

export function getCompletionStatusKey(status: CompletionStatus) {
  return `${CompletionStatusType}_${CompletionStatus[status]}`;
}

const CompletionStatusNames = {
  [CompletionStatus.Planned]: "Planned",
  [CompletionStatus.InProgress]: "In Progress",
  [CompletionStatus.Completed]: "Completed",
  [CompletionStatus.Void]: "Void",
}

export function getCompletionStatusName(status: CompletionStatus) {
  return CompletionStatusNames[status];
}