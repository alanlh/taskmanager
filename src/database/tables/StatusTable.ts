import { Tables } from "../LocalDatabase";
import Table from "./Table";

export enum StatusTableColumns {
  STATUS_ENTRY_ID,
  STATUS_VALUE,
  STATUS_TYPE,
  JOB_ID,

  __LENGTH,
}

type ValidStatusTableColumn = Exclude<StatusTableColumns, StatusTableColumns.__LENGTH>;

type StatusTableColumnTypes = [
  string,
  string,
  string,
  string,
]

export default class StatusTable extends Table<ValidStatusTableColumn, StatusTableColumnTypes, StatusTableColumnTypes[StatusTableColumns.STATUS_ENTRY_ID]> {
  constructor() {
    super({
      tableName: "STATUS_TABLE",
      columnEnum: StatusTableColumns,
      keyColumn: StatusTableColumns.STATUS_ENTRY_ID,
      columnParams: {
        [StatusTableColumns.STATUS_ENTRY_ID]: {
          defaultValueGenerator: () => this.getUniqueKey(),
        },
        [StatusTableColumns.STATUS_VALUE]: {
          defaultValueGenerator: () => "",
          indexed: true,
          trackingTable: Tables.StatusLog,
        },
        [StatusTableColumns.STATUS_TYPE]: {
          defaultValueGenerator: () => "",
          indexed: true,
        },
        [StatusTableColumns.JOB_ID]: {
          defaultValueGenerator: () => "",
          indexed: true,
        },
      }
    })
  }

  protected getUniqueKey(): string {
    return this.getUuid();
  }
  
}