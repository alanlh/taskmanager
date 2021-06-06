import { useCallback } from "react";
import { CompletionStatus, CompletionStatusType, getCompletionStatusKey, getCompletionStatusName } from "../../data/CompletionStatus";
import StatusDefinitionOps from "../../operations/StatusDefinitionOps";
import StatusOps from "../../operations/StatusOps";
import "./CompletionStatusField.css";

interface ICompletionStatusFieldProps {
  id: string,
}

const CompletionStatusField = ({ id }: ICompletionStatusFieldProps) => {
  const [completionStatus, setCompletionStatus] = StatusOps.useCompletionStatus(id);
  const [statusValuesAndNames] = StatusDefinitionOps.useAllStatusValuesAndNames(CompletionStatusType);

  const setCheckboxStatus: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setCompletionStatus(getCompletionStatusKey(e.currentTarget.checked ? CompletionStatus.Completed : CompletionStatus.InProgress));
  }, [setCompletionStatus]);

  const setSelectStatus: React.ChangeEventHandler<HTMLSelectElement> = useCallback((e) => {
    setCompletionStatus(e.currentTarget.value);
  }, [setCompletionStatus]);

  return <div className="completion-status-field">
    <input type="checkbox" checked={completionStatus === getCompletionStatusKey(CompletionStatus.Completed)}
      onChange={ setCheckboxStatus } />
    <select onChange={setSelectStatus} value={completionStatus}>
      {
        statusValuesAndNames.map(([value, name], index) => <option value={value} key={index}>
          {name}
        </option>)
      }
    </select>
  </div>
};

export default CompletionStatusField;