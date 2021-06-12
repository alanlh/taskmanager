import { JobType } from "../../data/JobType";
import { Tables } from "../LocalDatabase";
import Table from "./Table";
import TrackingTable from "./TrackingTable";

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
      keyColumn: JobColumn.ID,
      columnEnum: JobColumn,
      columnParams: {
        [JobColumn.ID]: {
          columnName: "ID",
          defaultValueGenerator: () => this.getUniqueKey(),
        },
        [JobColumn.NAME]: {
          columnName: "NAME",
          defaultValueGenerator: () => "",
        },
        [JobColumn.JOB_TYPE]: {
          defaultValueGenerator: () => JobType.Task,
          indexed: true,
        },
        [JobColumn.CHILD_TASK_OF]: {
          defaultValueGenerator: () => undefined,
          indexed: true,
        },
        [JobColumn.CHILD_PROJECT_OF]: {
          defaultValueGenerator: () => undefined,
          indexed: true,
        },
        [JobColumn.DESCRIPTION]: {
          defaultValueGenerator: () => "",
        },
        [JobColumn.DUE_DATE]: {
          defaultValueGenerator: () => new Date(),
          trackingTable: Tables.DueDateLog,
        },
        [JobColumn.BEST_CASE_TIME]: {
          defaultValueGenerator: () => 0,
          trackingTable: Tables.EstTimeBest,
        },
        [JobColumn.ESTIMATED_TIME]: {
          defaultValueGenerator: () => 0,
          trackingTable: Tables.EstTimeExpected,
        },
        [JobColumn.WORST_CASE_TIME]: {
          defaultValueGenerator: () => 0,
          trackingTable: Tables.EstTimeWorst,
        },
        [JobColumn.MINUTES_SPENT]: {
          defaultValueGenerator: () => 0,
        },
      },
    });
  }

  protected getUniqueKey() {
    return this.getUuid();
  }
}