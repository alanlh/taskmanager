import { useMemo } from "react";
import { CompletionStatusType } from "../data/CompletionStatus";
import { Tables } from "../database/LocalDatabase";
import { StatusTableColumns } from "../database/tables/StatusTable";
import DatabaseOps from "./DatabaseOps";

const StatusOps = {
  useCompletionStatus(jobId: string) {
    // TODO: Remove once we implement dual-indices
    const completionStatusId = useMemo(() => {
      const statusIdsForJob = DatabaseOps.getIndexState(Tables.Status, StatusTableColumns.JOB_ID, jobId);
      for (const statusId of statusIdsForJob) {
        const statusType = DatabaseOps.getCellState(Tables.Status, statusId, StatusTableColumns.STATUS_TYPE);
        if (statusType === CompletionStatusType) {
          return statusId;
        }
      }
      // This shouldn't happen because we always create a completion status entry when creating a new job.
      console.warn("No completion status for job", jobId);
      return "";
    }, [jobId]);
    return DatabaseOps.useCellState(Tables.Status, completionStatusId, StatusTableColumns.STATUS_VALUE);
  }
}

export default StatusOps;