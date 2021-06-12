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
      keyColumn: TimeLogColumns.LOG_ID,
      columnEnum: TimeLogColumns,
      columnParams: {
        [TimeLogColumns.LOG_ID]: {
          defaultValueGenerator: () => this.getUniqueKey(),
        },
        [TimeLogColumns.JOB_ID]: {
          defaultValueGenerator: () => "",
          indexed: true,
        },
        [TimeLogColumns.VALUE]: {
          defaultValueGenerator: () => 0,
          trackingTable: Tables.TimeLogHistory,
        },
        [TimeLogColumns.DESCRIPTION]: {
          defaultValueGenerator: () => "",
        },
      }
    });
  }
  
  protected getUniqueKey(): string {
    return this.getUuid();
  }
  
}