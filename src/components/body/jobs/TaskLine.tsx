import { useCallback, useState } from "react";
import JobOps from "../../../operations/JobOps";
import CompletionStatusField from "../../fields/CompletionStatusField";
import DueDateField from "../../fields/DueDateField";
import TimeLogEntryNew from "../timelog/TimeLogEntryNew";
import "./TaskLine.css";
import "./JobLine.css";
import { useToggleState } from "../../../operations/UtilityHooks";
import { formatDuration } from "../../../utility/StringUtility";
import PopupContainer from "../../popup/PopupContainer";
import LocalSettingOps from "../../../operations/LocalSettingOps";

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

  const [isTimeLogWidgetOpen, showTimeLogWidget, closeTimeLogWidget] = useToggleState(false);

  const requestOpenPopup = useCallback(() => {
    LocalSettingOps.requestOpenPopup(taskId);
  }, [taskId])

  return <div className="task">
    <div className="task-header">
      <div className="task-header-left" onClick={toggleBodyVisible}>
        {
          name === "" ? <p>(Unnamed Task)</p> : <p>{name}</p>
        }
      </div>
      <div className="task-header-right">
        <CompletionStatusField id={taskId} />
        <button className="job-button" onClick={requestOpenPopup}>Edit</button>
        <DueDateField id={taskId} />
        <div>
          <button onClick={isTimeLogWidgetOpen ? closeTimeLogWidget : showTimeLogWidget} className="time-log-widget-button job-button">Log Time</button>
          {
            <PopupContainer isOpen={isTimeLogWidgetOpen} onClose={closeTimeLogWidget} onRequestClose={closeTimeLogWidget} closeOnEsc closeOnOverlayClick>
              <div>
                <TimeLogEntryNew taskId={taskId} onLog={closeTimeLogWidget} onCancel={closeTimeLogWidget} />
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
  </div>
}

export default TaskLine;