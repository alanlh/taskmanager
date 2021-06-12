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
  string, ChangeType, ValueType
];

interface ITrackingTableParams<ValueType> {
  tableName: string,
  defaultValueGenerator: () => ValueType,
}

export default abstract class TrackingTable<ValueType> extends Table<ValidTrackingTableColumn, TrackingTableColumnTypes<ValueType>,
  TrackingTableColumnTypes<ValueType>[TrackingTableColumn.LOG_ID]> {
  constructor({
    tableName, defaultValueGenerator,
  }: ITrackingTableParams<ValueType>) {
    super({
      tableName: tableName,
      keyColumn: TrackingTableColumn.LOG_ID,
      columnEnum: TrackingTableColumn,
      columnParams: {
        [TrackingTableColumn.LOG_ID]: {
          defaultValueGenerator: () => this.getUniqueKey(),
        },
        [TrackingTableColumn.LOG_TIME]: {
          defaultValueGenerator: () => new Date(),
        },
        [TrackingTableColumn.ENTRY_ID]: {
          defaultValueGenerator: () => "",
          indexed: true,
        },
        [TrackingTableColumn.ENTRY_TYPE]: {
          defaultValueGenerator: () => ChangeType.Update,
        },
        [TrackingTableColumn.ENTRY_VALUE]: {
          defaultValueGenerator: defaultValueGenerator,
        },
      }
    });
  }

  protected getUniqueKey() {
    return this.getUuid();
  }
}