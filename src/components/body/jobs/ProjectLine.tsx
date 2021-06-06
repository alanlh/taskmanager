import React, { useCallback, useState } from "react";
import TaskLine from "./TaskLine";
import "./ProjectLine.css"
import PopupContainer from "../../popup/PopupContainer";
import CompletionStatusField from "../../fields/CompletionStatusField";
import JobOps from "../../../operations/JobOps";
import JobPopup from "./JobPopup";
import "./JobLine.css";

interface IProjectLineParams {
  projectId: string,
}

const ProjectLine = ({ projectId }: IProjectLineParams) => {
  const [name, setName] = JobOps.useName(projectId);
  const [description, setDescription] = JobOps.useDescription(projectId);
  const [childTaskIds] = JobOps.useChildTasks(projectId);
  const [childProjectIds] = JobOps.useChildProjects(projectId);

  const [bodyVisible, setBodyVisible] = useState(true);
  const toggleBodyVisible = useCallback(() => {
    setBodyVisible(!bodyVisible);
  }, [bodyVisible]);

  const onCreateChildProject = useCallback(() => {
    JobOps.createChildProject(projectId);
    setBodyVisible(true);
  }, [projectId, setBodyVisible]);

  const onCreateChildTask = useCallback(() => {
    JobOps.createChildTask(projectId);
    setBodyVisible(true);
  }, [projectId, setBodyVisible]);

  const [isPopupOpen, setPopupOpen] = useState(false);
  const openPopup = useCallback(() => {
    setPopupOpen(true);
  }, [setPopupOpen]);
  const closePopup = useCallback(() => {
    setPopupOpen(false);
  }, [setPopupOpen]);

  return <div className="project">
    <div className="project-header">
      <div className="project-header-left">
        <div className="project-namefield" onClick={toggleBodyVisible}>
          {
            name === "" ? <p>(Unnamed Project)</p> : <p>{name}</p>
          }
        </div>
      </div>
      <div className="project-header-right">
        <button className="job-button" onClick={onCreateChildProject}>Add Project</button>
        <button className="job-button" onClick={onCreateChildTask}>Add Task</button>
        <CompletionStatusField id={projectId}/>
        <button className="job-button" onClick={openPopup}>Edit</button>
      </div>
    </div>
    <div className={`project-body ${bodyVisible ? "" : "hidden"}`}>
      <div className="project-data">
        <div className="project-description">
          {
            description === "" ? <p>(No Description)</p> : <p>{description}</p>
          }
        </div>
      </div>
      <div className="project-tasks">
        {
          childTaskIds.map((taskId, index) => {
            return <React.Fragment key={index}>
              <TaskLine taskId={taskId} />
            </React.Fragment>
          })
        }
      </div>
      <div className="project-children">
        {
          childProjectIds.map((projectId, index) => {
            return <React.Fragment key={index}>
              <ProjectLine projectId={projectId} />
            </React.Fragment>
          })
        }
      </div>
    </div>
    <JobPopup jobId={projectId} isOpen={isPopupOpen} onClose={closePopup} />
  </div>
}

export default ProjectLine;