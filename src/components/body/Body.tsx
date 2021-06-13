import React, { useCallback, useState } from "react";
import ProjectLine from "./jobs/ProjectLine";
import TaskLine from "./jobs/TaskLine";
import "./Body.css";
import JobOps from "../../operations/JobOps";
import JobPopup from "./jobs/JobPopup";
import LocalSettingOps from "../../operations/LocalSettingOps";

const Body = () => {
  const [taskIds] = JobOps.useRootTasks();
  const [rootProjects] = JobOps.useRootProjects();

  const [openedJobId] = LocalSettingOps.useJobWithPopupOpen();

  const onCreateChildProject = useCallback(() => {
    JobOps.createRootProject();
  }, []);

  const onCreateChildTask = useCallback(() => {
    JobOps.createRootTask();
  }, []);

  return <div className="body">
    <div className="project-header-right">
      <button className="project-button" onClick={onCreateChildProject}>Add Project</button>
      <button className="project-button" onClick={onCreateChildTask}>Add Task</button>
    </div>

    <div className="body-tasks">
      {
        taskIds ? taskIds.map((taskId, index) => {
          return <TaskLine taskId={taskId} key={index} />
        }) : undefined
      }
    </div>
    <div className="body-projects">
      {
        rootProjects.map((projectId, index) => {
          return <ProjectLine projectId={projectId} key={index} />
        })
      }
    </div>
    {
      openedJobId !== undefined ? <JobPopup jobId={openedJobId} onClose={LocalSettingOps.closePopup} isOpen={true} /> : undefined
    }
  </div>;
};

export default Body;
