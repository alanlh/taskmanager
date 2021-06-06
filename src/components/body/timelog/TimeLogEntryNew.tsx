import { useCallback, useState } from "react";
import TimeLogOps from "../../../operations/TimeLogOps";
import TimeLogField from "../../fields/TimeLogField";
import "./TimeLogEntryNew.css";

interface ITimeLogEntryNew {
  taskId: string,
  onLog?: () => void;
  className?: string,
}

const TimeLogEntryNew = ({ taskId, onLog, className }: ITimeLogEntryNew) => {
  const [time, setTime] = useState(15);
  const [description, setDescription] = useState("");

  const logInputTime = useCallback(() => {
    TimeLogOps.createTimeLogEntry(taskId, time, description);
    if (onLog) {
      onLog();
    }
  }, [taskId, time, description, onLog]);

  return <TimeLogField
    description={description} setDescription={setDescription}
    duration={time} setDuration={setTime}
    editMode={true}
    onSubmit={logInputTime}
    className={className}
  />;
}

export default TimeLogEntryNew;