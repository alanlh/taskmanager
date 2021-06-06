import React, { useCallback, useRef, useState } from "react";
import JobOps from "../../operations/JobOps";
import "./DescriptionField.css";
import TextInputField from "./TextInputField";

interface IDescriptionFieldParams {
  id: string,
}

const DescriptionField = ({
  id
}: IDescriptionFieldParams) => {
  const [description, setDescription] = JobOps.useDescription(id);
  const [editMode, setEditMode] = useState(false);
  
  return <TextInputField
    multiRow
    className="descriptionfield-input-field"
    editMode={editMode}
    setEditMode={setEditMode}
    setEditModeOnFocus
    value={description}
    minRows={5}
    maxRows={20}
    setValue={setDescription}
  />
};

export default DescriptionField;