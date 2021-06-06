import { useCallback } from "react";
import { Tables } from "../../database/LocalDatabase";
import JobOps from "../../operations/JobOps";
import "./CompletionStatusField.css";

interface IDueDateFieldProps {
  id: string,
}

const DueDateField = ({ id }: IDueDateFieldProps) => {
  const [dueDate, setDueDate] = JobOps.useDueDate(id);

  const onChangeDueDate: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    console.log(e.currentTarget.valueAsDate);
    setDueDate(e.currentTarget.valueAsDate!);
  }, [setDueDate]);

  return <div className="completion-status-field">
    <input type="date" value={dueDate.toISOString().substr(0, 10)} onChange={onChangeDueDate} />
  </div>
};

export default DueDateField;