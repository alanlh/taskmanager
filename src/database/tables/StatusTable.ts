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
      columnCount: StatusTableColumns.__LENGTH,
      columnNames: [
        "STATUS_ENTRY_ID",
        "STATUS_VALUE",
        "STATUS_TYPE",
        "JOB_ID",
      ],
      defaultValues: [
        "", "", "", "",
      ],
      indexedColumns: [
        StatusTableColumns.JOB_ID,
        StatusTableColumns.STATUS_TYPE,
        StatusTableColumns.STATUS_VALUE,
      ],
      keyColumn: StatusTableColumns.STATUS_ENTRY_ID,
      trackingTables: new Map([
        [StatusTableColumns.STATUS_VALUE, Tables.StatusLog],
      ]),
    })
  }

  protected getUniqueKey(): string {
    return this.getUuid();
  }
  
}