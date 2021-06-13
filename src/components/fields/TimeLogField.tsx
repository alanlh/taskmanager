import { useCallback, useEffect, useRef } from "react"
import DurationField from "./DurationField"
import TextInputField from "./TextInputField"
import "./TimeLogField.css"

interface ITimeLogFieldParams {
  duration: number,
  setDuration?: (newDuration: number) => void,
  description: string,
  setDescription?: (newDescription: string) => void,
  editMode: boolean,
  allowToggleEditMode?: boolean,
  onSetEditable?: () => void,
  onSubmit?: () => void,
  onSetReadonly?: () => void,
  allowDelete?: boolean,
  onDelete?: () => void,
  className?: string
}

const TimeLogField = ({
  duration, setDuration, description, setDescription, editMode, allowToggleEditMode, onSetEditable, onSubmit, onSetReadonly, allowDelete, onDelete,
  className,
}: ITimeLogFieldParams) => {

  const durationRef: React.MutableRefObject<HTMLInputElement | null> = useRef(null);
  const editButtonRef: React.MutableRefObject<HTMLButtonElement | null> = useRef(null);

  const onSave = useCallback(() => {
    if (onSubmit !== undefined) {
      onSubmit();
    }
    if (allowToggleEditMode && onSetReadonly !== undefined) {
      onSetReadonly();
    }
    editButtonRef.current?.focus();
  }, [onSubmit, allowToggleEditMode, onSetReadonly]);

  const onClickEditButton = useCallback(() => {
    if (allowToggleEditMode && onSetEditable) {
      onSetEditable();
    }
    durationRef.current?.focus();
    durationRef.current?.select();
  }, [allowToggleEditMode, onSetEditable, durationRef]);

  const onClickCancelButton = useCallback(() => {
    if (onSetReadonly) {
      onSetReadonly();
    }
    editButtonRef.current?.focus();
  }, [onSetReadonly])

  useEffect(() => {
    if (editMode) {
      durationRef.current?.focus();
      durationRef.current?.select();
    }
  }, [editMode]);

  return <div className={`${className || ""} time-log-field`}>
    <div className="time-log-field-upper">
      <DurationField time={duration} setTime={setDuration} readonly={!editMode} className="time-log-field-duration" ref={durationRef} />
      <TextInputField
        editMode={editMode}
        value={description}
        setValue={setDescription}
        multiRow={false}
        className="time-log-field-description"
      />
    </div>
    <div className="time-log-field-lower">
      <button onClick={onClickEditButton} hidden={editMode || !allowToggleEditMode} className="time-log-field-button" ref={editButtonRef}>Edit</button>
      <button onClick={onSave} hidden={!editMode} className="time-log-field-button">Save</button>
      <button onClick={onClickCancelButton} hidden={!editMode || !allowToggleEditMode} className="time-log-field-button">Cancel</button>
      <button onClick={onDelete} hidden={!allowDelete || editMode} className="time-log-field-button">Delete</button>
    </div>
  </div>
};

export default TimeLogField;
