import { useState } from "react";
import JobOps from "../../operations/JobOps";
import "./NameField.css";
import TextInputField from "./TextInputField";

interface INameFieldParams {
  id: string,
}

const NameField = ({
  id
}: INameFieldParams) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = JobOps.useName(id);

  return <TextInputField
    className="namefield-input-field"
    editMode={editMode}
    setValue={setName}
    value={name}
    setEditMode={setEditMode}
    setEditModeOnFocus
  />
};

export default NameField;