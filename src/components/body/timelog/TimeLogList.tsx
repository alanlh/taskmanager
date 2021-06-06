import { useState } from "react";
import { JobType } from "../../../data/JobType";
import JobOps from "../../../operations/JobOps";
import TimeLogOps from "../../../operations/TimeLogOps"
import { useToggleState } from "../../../operations/UtilityHooks";
import { formatDuration } from "../../../utility/StringUtility";
import TimeLogEntryNew from "./TimeLogEntryNew";
import TimeLogEntry from "./TimeLogEntry";
import "./TimeLogList.css";

interface ITimeLogListParams {
  jobId: string,
}

const TimeLogList = ({ jobId, }: ITimeLogListParams) => {
  const [jobType] = JobOps.useJobType(jobId);

  const [timeLogEntries] = TimeLogOps.useEntryIdsForJob(jobId);
  const [timeSpent] = JobOps.useTimeSpent(jobId);

  const [isNewEntryShown, , hideNewEntry, toggleNewEntry] = useToggleState(false);

  return <div className="time-log-list">
    <div className="time-log-list-header">
      <h3 className="time-log-list-header-title">Logged Time</h3>
      <p className="time-log-list-header-time-spent">Total: {formatDuration(timeSpent)}</p>
      {
        jobType === JobType.Task ? <button onClick={toggleNewEntry} className="time-log-list-header-new-log-button">Log Time</button> : undefined
      }
    </div>
    {
      isNewEntryShown ? <TimeLogEntryNew taskId={jobId} onLog={hideNewEntry} className="time-log-list-header-new-log-entry" /> : undefined
    }
    <div className="time-log-list-entries">
      {
        timeLogEntries.map((entryId, index) => <TimeLogEntry key={index} timeLogId={entryId} />)
      }
    </div>
  </div>
}

export default TimeLogList;