import { Tables } from "../LocalDatabase";
import Table from "./Table";

export enum TimeLogColumns {
  LOG_ID, JOB_ID, VALUE,
  DESCRIPTION,

  __LENGTH,
}

type ValidTimeLogColumn = Exclude<TimeLogColumns, TimeLogColumns.__LENGTH>;

type TimeLogColumnTypes = [
  string, string, number, string,
]

export default class TimeLogTable extends Table<ValidTimeLogColumn, TimeLogColumnTypes, TimeLogColumnTypes[TimeLogColumns.LOG_ID]> {
  constructor() {
    super({
      tableName: "TIME_LOG",
      columnCount: TimeLogColumns.__LENGTH,
      columnNames: [
        "LOG_ID", "JOB_ID", "VALUE",
        "DESCRIPTION",
      ],
      defaultValues: [
        "", "", 0, "",
      ],
      indexedColumns: [
        TimeLogColumns.JOB_ID,
      ],
      keyColumn: TimeLogColumns.LOG_ID,
      trackingTables: new Map([
        [TimeLogColumns.VALUE, Tables.TimeLogHistory],
      ]),
    });
  }
  
  protected getUniqueKey(): string {
    return this.getUuid();
  }
  
}