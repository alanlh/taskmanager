import React, { useCallback, useState } from "react";

// Note to self: When creating a new hook, make sure to update package.json as well.

export function useToggleState(initialValue: boolean) {
  const [state, setState] = useState(initialValue);
  const toggleState = useCallback(() => {
    setState(!state);
  }, [state, setState]);
  const enableState = useCallback(() => {
    setState(true);
  }, [setState]);
  const disableState = useCallback(() => {
    setState(false);
  }, [setState])
  return [state, enableState, disableState, toggleState] as const;
}

export function useOnContainerBlur(onBlur: (() => void) | undefined, deps: React.DependencyList): React.FocusEventHandler {
  return useCallback(onBlur ? (e) => {
    if (e.relatedTarget === null || !e.currentTarget.contains(e.relatedTarget as Node)) {
      onBlur();
    }
  } : () => { }, [...deps]);
}

export function useSaveableState<T>(valueFromSave: T, setValueFromSave: (newValue: T) => void, allowExternalUpdates: boolean) {
  const [savedValue, setSavedValue] = useState(valueFromSave);
  if (savedValue !== valueFromSave) {
    setSavedValue(valueFromSave);
  }

  const [localValue, setLocalValue] = useState(valueFromSave);
  if (valueFromSave !== localValue && allowExternalUpdates) {
    setLocalValue(valueFromSave);
  }

  const saveValue = useCallback((newValue: T) => {
    setValueFromSave(newValue);
  }, [setValueFromSave]);

  return [localValue, setLocalValue, saveValue] as const;
}