import { forwardRef, useCallback } from "react";
import "./DurationField.css";

interface IDurationFieldParams {
  time: number,
  setTime?: (newTime: number) => void,
  readonly: boolean,
  className?: string,
  ref?: React.MutableRefObject<HTMLInputElement | null>,
}

const DurationField = forwardRef(({
  time, setTime, readonly, className
}: IDurationFieldParams, ref: React.ForwardedRef<HTMLInputElement | null>) => {
  const minutes = time % 60;
  const hours = (time - minutes) / 60;

  const setInputHours: React.FormEventHandler<HTMLInputElement> = useCallback((e) => {
    if (setTime) {
      setTime(60 * e.currentTarget.valueAsNumber + minutes);
    }
  }, [setTime, minutes]);

  const setInputMinutes: React.FormEventHandler<HTMLInputElement> = useCallback((e) => {
    if (setTime) {
      setTime(60 * hours + e.currentTarget.valueAsNumber);
    }
  }, [setTime, hours]);

  return <div className={`${className}`}>
    <input className="duration-field-input" type="number" min={0} max={23} step={1} value={hours} onChange={setInputHours} readOnly={readonly} ref={ref}/>Hr
    <input className="duration-field-input" type="number" min={0} max={59} step={5} value={minutes} onChange={setInputMinutes} readOnly={readonly} />Min
  </div>
})

export default DurationField;