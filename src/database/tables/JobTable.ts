import { JobType } from "../../data/JobType";
import { Tables } from "../LocalDatabase";
import Table from "./Table";

export enum JobColumn {
  ID, NAME, JOB_TYPE,
  CHILD_TASK_OF, CHILD_PROJECT_OF,
  DESCRIPTION, DUE_DATE,
  BEST_CASE_TIME, ESTIMATED_TIME, WORST_CASE_TIME,
  MINUTES_SPENT,

  __LENGTH
}
type ValidJobColumn = Exclude<JobColumn, JobColumn.__LENGTH>;
type JobColumnTypes = [
  string, string, JobType,
  string | undefined, string | undefined,
  string, Date,
  number, number, number,
  number,
];

export default class JobTable extends Table<ValidJobColumn, JobColumnTypes, JobColumnTypes[JobColumn.ID]> {
  constructor() {
    super({
      tableName: "JOBS",
      columnCount: JobColumn.__LENGTH,
      columnNames: ([...Array(JobColumn.__LENGTH).keys()] as JobColumn[]).map((val) => JobColumn[val]) as unknown as any, //i hate typescript
      keyColumn: JobColumn.ID,
      indexedColumns: [
        JobColumn.JOB_TYPE, JobColumn.CHILD_PROJECT_OF, JobColumn.CHILD_TASK_OF,
      ],
      defaultValues: [
        "", "", JobType.Task,
        undefined, undefined,
        "", new Date(),
        0, 0, 0,
        0,
      ],
      trackingTables: new Map([
        [JobColumn.DUE_DATE, Tables.DueDateLog],
        [JobColumn.BEST_CASE_TIME, Tables.EstTimeBest],
        [JobColumn.ESTIMATED_TIME, Tables.EstTimeExpected],
        [JobColumn.WORST_CASE_TIME, Tables.EstTimeWorst],
      ]),
    });
  }

  protected getUniqueKey() {
    return this.getUuid();
  }
}