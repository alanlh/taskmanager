import { useCallback, useState } from "react";
import JobOps from "../../../operations/JobOps";
import CompletionStatusField from "../../fields/CompletionStatusField";
import DueDateField from "../../fields/DueDateField";
import TimeLogEntryNew from "../timelog/TimeLogEntryNew";
import JobPopup from "./JobPopup";
import "./TaskLine.css";
import "./JobLine.css";
import { useOnContainerBlur, useToggleState } from "../../../operations/UtilityHooks";
import { formatDuration } from "../../../utility/StringUtility";
import PopupContainer from "../../popup/PopupContainer";

interface ITaskLineParams {
  taskId: string,
}

const TaskLine = ({ taskId }: ITaskLineParams) => {
  const [name] = JobOps.useName(taskId);
  const [description] = JobOps.useDescription(taskId);

  const [timeSpent] = JobOps.useTimeSpent(taskId);

  const [bodyVisible, setBodyVisible] = useState(true);
  const toggleBodyVisible = useCallback(() => {
    setBodyVisible(!bodyVisible);
  }, [bodyVisible]);

  const [isPopupOpen, openPopup, closePopup] = useToggleState(false);
  const [isTimeLogWidgetOpen, showTimeLogWidget, closeTimeLogWidget] = useToggleState(false);
  //const widgetOnBlur = useOnContainerBlur(closeTimeLogWidget, [closeTimeLogWidget]);

  return <div className="task">
    <div className="task-header">
      <div className="task-header-left" onClick={toggleBodyVisible}>
        {
          name === "" ? <p>(Unnamed Task)</p> : <p>{name}</p>
        }
      </div>
      <div className="task-header-right">
        <CompletionStatusField id={taskId} />
        <button className="job-button" onClick={openPopup}>Edit</button>
        <DueDateField id={taskId} />
        <div>
          <button onClick={isTimeLogWidgetOpen ? closeTimeLogWidget : showTimeLogWidget} className="time-log-widget-button job-button">Log Time</button>
          {
            <PopupContainer isOpen={isTimeLogWidgetOpen} onClose={closeTimeLogWidget} onRequestClose={closeTimeLogWidget} closeOnEsc closeOnOverlayClick>
              <div>
                <TimeLogEntryNew taskId={taskId} onLog={closeTimeLogWidget} />
              </div>
            </PopupContainer>
          }
        </div>
        <button className="job-button">Est. Time</button>
      </div>
    </div>
    <div className={`task-body ${bodyVisible ? "" : "hidden"}`}>
      <div className="task-description">
        <p>{description === "" ? "(No Description)" : description}</p>
      </div>
      <p>Time Spent: {formatDuration(timeSpent)}</p>
    </div>
    <JobPopup jobId={taskId} onClose={closePopup} isOpen={isPopupOpen} />
  </div>
}

export default TaskLine;