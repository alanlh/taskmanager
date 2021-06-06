import { useCallback, useMemo } from "react";
import "./TextInputField.css";

interface ITextInputField {
  multiRow?: boolean,
  className?: string,
  editMode: boolean,
  setEditMode?: (editMode: boolean) => void,
  setEditModeOnFocus?: boolean,
  value: string,
  setValue?: (newValue: string) => void,
  onFocus?: () => void,
  onBlur?: () => void,
  minRows?: number,
  maxRows?: number,
}

const TextInputField = (params: ITextInputField) => {
  const onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = useCallback((e) => {
    if (params.setValue) {
      params.setValue(e.currentTarget.value);
    }
  }, [params.setValue]);

  let rows = useMemo(() => (params.value.match(/\n/g) || []).length + 1, [params.value]);
  if (params.minRows !== undefined && rows < params.minRows) {
    rows = params.minRows;
  }
  if (params.maxRows !== undefined && rows > params.maxRows) {
    rows = params.maxRows;
  }

  const defaultOnFocus = useCallback(() => {
    if (params.setEditMode !== undefined) {
      params.setEditMode(true);
    }
  }, [params.setEditMode]);

  const defaultOnBlur = useCallback(() => {
    if (params.setEditMode !== undefined) {
      params.setEditMode(false);
    }
  }, [params.setEditMode]);

  if (params.multiRow) {
    return <textarea
      value={params.value}
      onChange={onChange}
      readOnly={!params.editMode}
      className={`${params.className || ""} ${!params.editMode ? "text-input-field-readonly" : ""}`}
      onFocus={params.onFocus && !params.setEditModeOnFocus ? params.onFocus : defaultOnFocus}
      onBlur={params.onBlur && !params.setEditModeOnFocus ? params.onBlur : defaultOnBlur}
      rows={rows}
    />
  } else {
    return <input
      value={params.value}
      onChange={onChange}
      readOnly={!params.editMode}
      className={`${params.className || ""} ${!params.editMode ? "text-input-field-readonly" : ""}`}
      onFocus={params.onFocus && !params.setEditModeOnFocus ? params.onFocus : defaultOnFocus}
      onBlur={params.onBlur && !params.setEditModeOnFocus ? params.onBlur : defaultOnBlur}
    />
  }
}

export default TextInputField;