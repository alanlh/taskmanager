import { CompletionStatus, CompletionStatusType, getCompletionStatusKey } from "../data/CompletionStatus";
import { JobType } from "../data/JobType";
import { Tables } from "../database/LocalDatabase";
import { JobColumn } from "../database/tables/JobTable";
import { StatusTableColumns } from "../database/tables/StatusTable";
import DatabaseOps from "./DatabaseOps";
import LocalSettingOps from "./LocalSettingOps";

const JobOps = {
  useName(jobId: string) {
    return DatabaseOps.useCellState(Tables.Jobs, jobId, JobColumn.NAME);
  },

  useDescription(jobId: string) {
    return DatabaseOps.useCellState(Tables.Jobs, jobId, JobColumn.DESCRIPTION);
  },

  useJobType(jobId: string) {
    return DatabaseOps.useReadonlyCellState(Tables.Jobs, jobId, JobColumn.JOB_TYPE);
  },

  useDueDate(jobId: string) {
    return DatabaseOps.useCellState(Tables.Jobs, jobId, JobColumn.DUE_DATE);
  },

  useTimeSpent(jobId: string) {
    return DatabaseOps.useReadonlyCellState(Tables.Jobs, jobId, JobColumn.MINUTES_SPENT);
  },

  useChildTasks(projectId: string) {
    const [childTasks] = DatabaseOps.useIndexState(Tables.Jobs, JobColumn.CHILD_TASK_OF, projectId);
    return [childTasks];
  },

  useRootTasks() {
    return DatabaseOps.useIndexState(Tables.Jobs, JobColumn.CHILD_TASK_OF, "");
  },

  useChildProjects(projectId: string) {
    // TODO - Pass in filtering/sorting settings.
    return DatabaseOps.useIndexState(Tables.Jobs, JobColumn.CHILD_PROJECT_OF, projectId);
  },

  useRootProjects() {
    // TODO: pass in filtering/sorting settings.
    return DatabaseOps.useIndexState(Tables.Jobs, JobColumn.CHILD_PROJECT_OF, "");
  },

  createRootProject() {
    return JobOps.createChildProject("");
  },

  createRootTask() {
    return JobOps.createChildTask("");
  },

  createChildProject(projectId?: string) {
    // TODO: Use a Record instead of Tuple so we can specify arbitrary parameters.
    const defaultValues = DatabaseOps.generateDefaultRow(Tables.Jobs);
    defaultValues[JobColumn.JOB_TYPE] = JobType.Project;
    defaultValues[JobColumn.CHILD_PROJECT_OF] = projectId;
    const jobId = DatabaseOps.createRow(Tables.Jobs, defaultValues);

    // Also set a completion status by default.
    const completionStatusValue = DatabaseOps.generateDefaultRow(Tables.Status);
    completionStatusValue[StatusTableColumns.JOB_ID] = jobId;
    completionStatusValue[StatusTableColumns.STATUS_TYPE] = CompletionStatusType;
    completionStatusValue[StatusTableColumns.STATUS_VALUE] = getCompletionStatusKey(CompletionStatus.Planned);
    DatabaseOps.createRow(Tables.Status, completionStatusValue);

    LocalSettingOps.requestOpenPopup(jobId);

    return jobId;
  },

  createChildTask(projectId?: string) {
    const defaultValues = DatabaseOps.generateDefaultRow(Tables.Jobs);
    defaultValues[JobColumn.JOB_TYPE] = JobType.Task;
    defaultValues[JobColumn.CHILD_TASK_OF] = projectId;
    const jobId = DatabaseOps.createRow(Tables.Jobs, defaultValues);

    // Also set a completion status by default.
    const completionStatusValue = DatabaseOps.generateDefaultRow(Tables.Status);
    completionStatusValue[StatusTableColumns.JOB_ID] = jobId;
    completionStatusValue[StatusTableColumns.STATUS_TYPE] = CompletionStatusType;
    completionStatusValue[StatusTableColumns.STATUS_VALUE] = getCompletionStatusKey(CompletionStatus.Planned);
    DatabaseOps.createRow(Tables.Status, completionStatusValue);

    LocalSettingOps.requestOpenPopup(jobId);

    return jobId;
  },
}

export default JobOps;