import { ChangeType } from "../../data/ChangeType";
import Table from "./Table";

export enum TrackingTableColumn {
  LOG_ID, LOG_TIME,
  ENTRY_ID, ENTRY_TYPE, ENTRY_VALUE,

  __LENGTH
}

type ValidTrackingTableColumn = Exclude<TrackingTableColumn, TrackingTableColumn.__LENGTH>;

type TrackingTableColumnTypes<ValueType> = [
  string, Date,
  string, ChangeType, ValueType,
];

interface ITrackingTableParams<ValueType> {
  tableName: string,
  defaultValue: ValueType,
}

export default abstract class TrackingTable<ValueType> extends Table<ValidTrackingTableColumn, TrackingTableColumnTypes<ValueType>,
  TrackingTableColumnTypes<ValueType>[TrackingTableColumn.LOG_ID]> {
  constructor({
    tableName, defaultValue,
  }: ITrackingTableParams<ValueType>) {
    super({
      tableName: tableName,
      columnCount: TrackingTableColumn.__LENGTH,
      columnNames: [
        "LOG_ID", "LOG_TIME", "ENTRY_ID", "ENTRY_TYPE", "ENTRY_VALUE"
      ],
      keyColumn: TrackingTableColumn.LOG_ID,
      indexedColumns: [
        TrackingTableColumn.ENTRY_ID, TrackingTableColumn.ENTRY_VALUE,
      ],
      defaultValues: ["", new Date(), "", ChangeType.Update, defaultValue],
      trackingTables: new Map(),
    });
  }

  protected getUniqueKey() {
    return this.getUuid();
  }
}

