import { useCallback } from "react";
import TimeLogOps from "../../../operations/TimeLogOps";
import { useSaveableState, useToggleState } from "../../../operations/UtilityHooks";
import TimeLogField from "../../fields/TimeLogField";
import "./TimeLogEntry.css";

interface ITimeLogEntryParams {
  timeLogId: string,
}

const TimeLogEntry = ({timeLogId}: ITimeLogEntryParams) => {  
  const [editMode, setEditable, setReadonly] = useToggleState(false);

  const [description, setLocalDescription, saveDescription] = useSaveableState(...TimeLogOps.useDescription(timeLogId), !editMode);
  const [timeValue, setLocalTimeValue, saveTimeValue] = useSaveableState(...TimeLogOps.useTimeValue(timeLogId), !editMode);

  const onSubmit = useCallback(() => {
    saveDescription(description);
    saveTimeValue(timeValue);
  }, [description, timeValue, saveDescription, saveTimeValue]);

  return <TimeLogField
    description={description} setDescription={setLocalDescription}
    duration={timeValue} setDuration={setLocalTimeValue}
    editMode={editMode} allowToggleEditMode
    onSetEditable={setEditable}
    onSetReadonly={setReadonly}
    onSubmit={onSubmit}
    allowDelete
  />
}

export default TimeLogEntry;