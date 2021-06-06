import { useCallback } from "react";
import { Tables } from "../database/LocalDatabase";
import { JobColumn } from "../database/tables/JobTable";
import { TimeLogColumns } from "../database/tables/TimeLogTable";
import DatabaseOps from "./DatabaseOps";

const TimeLogOps = {
  useLoggedTime(jobId: string) {
    const [currentTime] = DatabaseOps.useCellState(Tables.Jobs, jobId, JobColumn.MINUTES_SPENT);

    const logTime = (duration: number) => {
      TimeLogOps.createTimeLogEntry(jobId, duration);
    }

    return [currentTime, logTime] as const;
  },

  useEntryIdsForJob(jobId: string) {
    return DatabaseOps.useIndexState(Tables.TimeLog, TimeLogColumns.JOB_ID, jobId);
  },

  useEntryValues(jobId: string) {
    return DatabaseOps.useRelatedIndexState(Tables.TimeLog, TimeLogColumns.JOB_ID, jobId, TimeLogColumns.VALUE);
  },

  useDescription(logId: string) {
    return DatabaseOps.useCellState(Tables.TimeLog, logId, TimeLogColumns.DESCRIPTION);
  },

  useTimeValue(logId: string) {
    // TODO: Need to update the job time value as well.
    const [timeValue, setTimeValue] = DatabaseOps.useCellState(Tables.TimeLog, logId, TimeLogColumns.VALUE);

    const updateTimeValue = useCallback((newValue: number) => {
      setTimeValue(newValue);
      // Need to update the time spent for all affected tasks and projects.
      const taskId = DatabaseOps.getCellState(Tables.TimeLog, logId, TimeLogColumns.JOB_ID);
      TimeLogOps.updateTimeSpentForJobs(taskId, newValue, timeValue);
    }, [logId, timeValue, setTimeValue]);

    return [timeValue, updateTimeValue] as const;
  },

  createTimeLogEntry(taskId: string, duration: number, description: string = "") {
    TimeLogOps.updateTimeSpentForJobs(taskId, duration, 0);

    const entryRow = DatabaseOps.generateDefaultRow(Tables.TimeLog);
    entryRow[TimeLogColumns.JOB_ID] = taskId;
    entryRow[TimeLogColumns.VALUE] = duration;
    entryRow[TimeLogColumns.DESCRIPTION] = description;
    DatabaseOps.createRow(Tables.TimeLog, entryRow);
  },

  updateTimeSpentForJobs(taskId: string, newDuration: number, previousDuration: number) {
    const diff = newDuration - previousDuration;

    const currentTime = DatabaseOps.getCellState(Tables.Jobs, taskId, JobColumn.MINUTES_SPENT);
    DatabaseOps.setCellState(Tables.Jobs, taskId, JobColumn.MINUTES_SPENT, currentTime + diff);

    let projectAncestorId = DatabaseOps.getCellState(Tables.Jobs, taskId, JobColumn.CHILD_TASK_OF);
    while (projectAncestorId !== undefined) {
      const currentTime = DatabaseOps.getCellState(Tables.Jobs, projectAncestorId, JobColumn.MINUTES_SPENT);
      DatabaseOps.setCellState(Tables.Jobs, projectAncestorId, JobColumn.MINUTES_SPENT, currentTime + diff);
      projectAncestorId = DatabaseOps.getCellState(Tables.Jobs, projectAncestorId, JobColumn.CHILD_PROJECT_OF);
    }
  }
}

export default TimeLogOps;