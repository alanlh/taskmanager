import StatusLogTable from "./tables/tracked/StatusLogTable";
import StatusDefinitionTable from "./tables/StatusDefinitionTable";
import Table from "./tables/Table";
import DueDateLogTable from "./tables/tracked/DueDateLogTable";
import JobTable from "./tables/JobTable";
import TimeLogTable from "./tables/TimeLogTable";
import TimeLogHistoryTable from "./tables/tracked/TimeLogHistoryTable";
import StatusTable from "./tables/StatusTable";
import { TrackingTableColumn } from "./tables/TrackingTable";
import { ChangeType } from "../data/ChangeType";
import EstimatedTimeBestCaseTable from "./tables/tracked/EstimatedTimeBestCaseTable";
import EstimatedTimeExpectedTable from "./tables/tracked/EstimatedTimeExpectedTable";
import EstimatedTimeWorstCaseTable from "./tables/tracked/EstimatedTimeWorstCaseTable";
import { OptionalTuple } from "../utility/Types";

export enum Tables {
  Jobs = "Jobs",
  StatusDefinitions = "StatusDefinitions",
  StatusLog = "StatusLog",
  Status = "Status",
  DueDateLog = "DueDateLog",
  TimeLog = "TimeLog",
  TimeLogHistory = "TimeLogHistory",

  EstTimeBest = "EstTimeBest",
  EstTimeExpected = "EstTimeExpected",
  EstTimeWorst = "EstTimeWorst",
}

export type TrackedTables = Tables.DueDateLog | Tables.TimeLogHistory | Tables.StatusLog
  | Tables.EstTimeBest | Tables.EstTimeExpected | Tables.EstTimeWorst;

// There are a lot of hacks relating to types in the code below.
// Most of them are due to limitations on Typescript's support for containers of different types.
// But since the main goal of this class is to define behavior shared between all Tables,
// it doesn't matter as much. 
// The alternative is to use "any" everywhere, which also means little type checking.
// But it would also provide no benefit to consumer code.

const DatabaseTables = {
  [Tables.Jobs]: new JobTable(),
  [Tables.StatusDefinitions]: new StatusDefinitionTable(),
  [Tables.StatusLog]: new StatusLogTable(),
  [Tables.Status]: new StatusTable(),
  [Tables.DueDateLog]: new DueDateLogTable(),
  [Tables.TimeLog]: new TimeLogTable(),
  [Tables.TimeLogHistory]: new TimeLogHistoryTable(),
  [Tables.EstTimeBest]: new EstimatedTimeBestCaseTable(),
  [Tables.EstTimeExpected]: new EstimatedTimeExpectedTable(),
  [Tables.EstTimeWorst]: new EstimatedTimeWorstCaseTable(),
} as const;

class LocalDatabase {
  private tableListeners: Map<Tables, Set<ChangeCallback>> = new Map();
  // Map from tables to rows to callbacks.
  private rowListeners: Map<Tables, Map<any, Set<ChangeCallback>>> = new Map();
  // Map from tables to rows to column to callbacks. 
  private cellListeners: Map<Tables, Map<any, Map<any, Set<ChangeCallback>>>> = new Map();
  // Map from tables to columns to callbacks.
  private columnListeners: Map<Tables, Map<any, Set<ChangeCallback>>> = new Map();
  // Map from tables to columns to indices (column values) to callbacks.
  private indexListeners: Map<Tables, Map<any, Map<any, Set<ChangeCallback>>>> = new Map();

  public async loadInitialData() {
    for (const key in DatabaseTables) {
      DatabaseTables[key as keyof typeof DatabaseTables].onLoad();
    }
  }

  public logTableData() {
    console.log(DatabaseTables);
  }

  //#region Data Access

  public getTableColumnCount(table: Tables) {
    return DatabaseTables[table].columnCount;
  }

  public getCell<T extends Tables, C extends ColumnDef<T>>(table: T, key: KeyType<T>, column: C): ColumnType<T, C> {
    return (DatabaseTables[table] as unknown as JobTable).getData(key as KeyType<Tables.Jobs>, column) as unknown as ColumnType<T, C>;
  }

  public getIndex<T extends Tables, C extends ColumnDef<T>>(tableType: T, column: C, value: ColumnType<T, C>): KeyType<T>[] {
    const table = DatabaseTables[tableType] as JobTable;
    return table.getRowsWithIndex(column, value) as KeyType<T>[];
  }

  public setCell<T extends Tables, C extends ColumnDef<T>>(table: T, key: KeyType<T>, column: C, value: ColumnType<T, C>) {
    const previousValue = this.getCell(table, key, column);
    if (previousValue === value) {
      return;
    }
    this._setCell(table, key, column, value, previousValue);
  }

  private _setCell<T extends Tables, C extends ColumnDef<T>>(tableName: T, key: KeyType<T>, column: C, value: ColumnType<T, C>, previousValue: ColumnType<T, C>) {
    const table = DatabaseTables[tableName] as unknown as JobTable;
    table.setData(key as KeyType<Tables.Jobs>, column, value);
    this._updateChangeTracking(tableName, key, column, value, ChangeType.Update);
    this._triggerIndexChange(tableName, key, column, value, previousValue);
  }

  private _updateChangeTracking<T extends Tables, C extends ColumnDef<T>>(tableName: T, key: KeyType<T>, column: C, value: ColumnType<T, C>, changeType: ChangeType) {
    const table = DatabaseTables[tableName] as unknown as JobTable;
    if (!table.trackingTables.has(column)) {
      return;
    }
    if (table.trackingTables.has(column)) {
      const trackingTable = table.trackingTables.get(column)!;
      const trackingTableRow = this.generateDefaultRow(trackingTable);
      trackingTableRow[TrackingTableColumn.LOG_TIME] = new Date();
      trackingTableRow[TrackingTableColumn.ENTRY_ID] = key as string; // hack
      trackingTableRow[TrackingTableColumn.ENTRY_TYPE] = changeType;
      trackingTableRow[TrackingTableColumn.ENTRY_VALUE] = value;

      this.createRow(trackingTable, trackingTableRow)
    }
  }

  private _triggerIndexChange<T extends Tables, C extends ColumnDef<T>>(table: T, key: KeyType<T>, column: C, value: ColumnType<T, C>, previousValue: ColumnType<T, C>) {
    // TODO: Do we want to change the order?
    this.triggerCallbackSet(this.tableListeners.get(table));
    this.triggerCallbackSet(this.rowListeners.get(table)?.get(key));
    this.triggerCallbackSet(this.cellListeners.get(table)?.get(key)?.get(column));
    this.triggerCallbackSet(this.columnListeners.get(table)?.get(column));
    // Need to trigger index change for both old and new value.
    this.triggerCallbackSet(this.indexListeners.get(table)?.get(column)?.get(previousValue));
    this.triggerCallbackSet(this.indexListeners.get(table)?.get(column)?.get(value));
  }

  private triggerCallbackSet(callbackSet?: Set<ChangeCallback>) {
    if (!callbackSet) {
      return;
    }
    for (const callback of callbackSet) {
      callback();
    }
  }

  public generateDefaultRow<T extends Tables>(table: T): OptionalTuple<ColumnTypes<T>> {
    return Array(Database.getTableColumnCount(table)).fill(undefined) as unknown as OptionalTuple<ColumnTypes<T>>;
  }

  public createRow<T extends Tables>(table: T, initialValues?: OptionalTuple<ColumnTypes<T>>) {
    const rowId = DatabaseTables[table].createRow(initialValues as any) as KeyType<T>;
    
    for (const [column] of DatabaseTables[table].trackingTables as ReadonlyMap<ColumnDef<T>, TrackedTables>) {
      this._updateChangeTracking(table, rowId, column, this.getCell(table, rowId, column as unknown as ColumnDef<T>), ChangeType.Create);
    }

    this.triggerCallbackSet(this.tableListeners.get(table));
    if (this.columnListeners.has(table)) {
      for (const column of this.columnListeners.get(table)!) {
        this.triggerCallbackSet(this.columnListeners.get(table)!.get(column));
      }
    }
    if (this.indexListeners.has(table)) {
      for (const [_, columnListeners] of this.indexListeners.get(table)!) {
        for (const [_, valueListeners] of columnListeners) {
          this.triggerCallbackSet(valueListeners);
        }
      }
    }
    // Do not trigger row or cell because it does not exist until now.
    return rowId;
  }

  //#endregion Data Access

  //#region Listeners

  public addTableListener(table: Tables, listener: ChangeCallback) {
    if (!this.tableListeners.has(table)) {
      this.tableListeners.set(table, new Set());
    }
    this.tableListeners.get(table)!.add(listener);
  }

  public removeTableListener(table: Tables, listener: ChangeCallback) {
    if (!this.tableListeners.has(table)) {
      console.warn("Attempting to remove non-existent listener from ", Tables[table]);
      return;
    }
    const tableListeners = this.tableListeners.get(table)!;
    if (!tableListeners.has(listener)) {
      console.warn("Attempting to remove non-existent listener from ", Tables[table]);
      return;
    }
    tableListeners.delete(listener);
    if (tableListeners.size === 0) {
      this.tableListeners.delete(table);
    }
  }

  public addRowListener<T extends Tables>(table: T, key: KeyType<T>, listener: ChangeCallback) {
    if (!this.rowListeners.has(table)) {
      this.rowListeners.set(table, new Map());
    }
    if (!this.rowListeners.get(table)!.has(key)) {
      this.rowListeners.get(table)!.set(key, new Set());
    }
    this.rowListeners.get(table)!.get(key)!.add(listener);
  }

  public removeRowListener<T extends Tables>(table: T, key: KeyType<T>, listener: ChangeCallback) {
    if (!this.rowListeners.has(table) || !this.rowListeners.get(table)!.has(key)) {
      console.warn("Attempting to remove non-existent listener from ", Tables[table], key);
      return;
    }
    const tableListeners = this.rowListeners.get(table)!;
    const rowListeners = tableListeners.get(key)!;
    if (!rowListeners.has(listener)) {
      console.warn("Attempting to remove non-existent listener from ", Tables[table], key);
      return;
    }
    rowListeners.delete(listener);
    if (rowListeners.size === 0) {
      tableListeners.delete(key);
    }
    if (tableListeners.size === 0) {
      this.rowListeners.delete(table);
    }
  }

  public addCellListener<T extends Tables>(table: T, key: KeyType<T>, column: ColumnDef<T>, listener: ChangeCallback) {
    if (!this.cellListeners.has(table)) {
      this.cellListeners.set(table, new Map());
    }
    if (!this.cellListeners.get(table)!.has(key)) {
      this.cellListeners.get(table)!.set(key, new Map());
    }
    if (!this.cellListeners.get(table)!.get(key)!.has(column)) {
      this.cellListeners.get(table)!.get(key)!.set(column, new Set());
    }
    this.cellListeners.get(table)!.get(key)!.get(column)!.add(listener);
  }

  public removeCellListener<T extends Tables>(table: T, key: KeyType<T>, column: ColumnDef<T>, listener: ChangeCallback) {
    if (!this.cellListeners.has(table) || !this.cellListeners.get(table)!.has(key) || !this.cellListeners.get(table)!.get(key)!.has(column)) {
      console.warn("Attempting to remove non-existent listener from ", Tables[table], key, column);
      return;
    }
    const tableListener = this.cellListeners.get(table)!;
    const rowListener = tableListener.get(key)!;
    const cellListeners = rowListener.get(column)!;
    if (!cellListeners.has(listener)) {
      console.warn("Attempting to remove non-existent listener from ", Tables[table], key, column);
      return;
    }
    cellListeners.delete(listener);
    if (cellListeners.size === 0) {
      rowListener.delete(column);
    }
    if (rowListener.size === 0) {
      tableListener.delete(key);
    }
    if (tableListener.size === 0) {
      this.cellListeners.delete(table);
    }
  }

  public addColumnListener<T extends Tables>(table: T, column: ColumnDef<T>, listener: ChangeCallback) {
    if (!this.columnListeners.has(table)) {
      this.columnListeners.set(table, new Map());
    }
    if (!this.columnListeners.get(table)!.has(column)) {
      this.columnListeners.get(table)!.set(column, new Set());
    }
    this.columnListeners.get(table)!.get(column)!.add(listener);
  }

  public removeColumnListener<T extends Tables>(table: T, column: ColumnDef<T>, listener: ChangeCallback) {
    if (!this.columnListeners.has(table) || !this.columnListeners.get(table)!.has(column)) {
      console.warn("Attempting to remove non-existent listener from ", Tables[table], column);
      return;
    }
    const tableListeners = this.columnListeners.get(table)!;
    const columnListeners = tableListeners.get(column)!;
    if (!columnListeners.has(listener)) {
      console.warn("Attempting to remove non-existent listener from ", Tables[table], column);
      return;
    }
    columnListeners.delete(listener);
    if (columnListeners.size === 0) {
      tableListeners.delete(column);
    }
    if (tableListeners.size === 0) {
      this.columnListeners.delete(table);
    }
  }

  public addIndexListener<T extends Tables, C extends ColumnDef<T>>(table: T, column: C, value: ColumnType<T, C>, listener: ChangeCallback) {
    if (!this.indexListeners.has(table)) {
      this.indexListeners.set(table, new Map());
    }
    if (!this.indexListeners.get(table)!.has(column)) {
      this.indexListeners.get(table)!.set(column, new Map());
    }
    if (!this.indexListeners.get(table)!.get(column)!.has(value)) {
      this.indexListeners.get(table)!.get(column)!.set(value, new Set());
    }
    this.indexListeners.get(table)!.get(column)!.get(value)!.add(listener);
  }

  public removeIndexListener<T extends Tables, C extends ColumnDef<T>>(table: T, column: C, value: ColumnType<T, C>, listener: ChangeCallback) {
    if (!this.indexListeners.has(table) || !this.indexListeners.get(table)!.has(column) || !this.indexListeners.get(table)!.get(column)!.has(value)) {
      console.warn("Attempting to remove non-existent listener from ", Tables[table], column, value);
      return;
    }
    const tableListener = this.indexListeners.get(table)!;
    const columnListener = tableListener.get(column)!;
    const indexListeners = columnListener.get(value)!;
    if (!indexListeners.has(listener)) {
      console.warn("Attempting to remove non-existent listener from ", Tables[table], column, value);
      return;
    }
    indexListeners.delete(listener);
    if (indexListeners.size === 0) {
      columnListener.delete(value);
    }
    if (columnListener.size === 0) {
      tableListener.delete(column);
    }
    if (tableListener.size === 0) {
      this.indexListeners.delete(table);
    }
  }

  //#endregion Listeners
}

type TableType<T extends Tables> = (typeof DatabaseTables)[T];
export type KeyType<T extends Tables> = TableType<T> extends Table<infer CDef, infer CType, infer KeyType> ? KeyType : never;
export type ColumnDef<T extends Tables> = TableType<T> extends Table<infer CDef, infer CType, infer KeyType> ? CDef : never;
export type ColumnTypes<T extends Tables> = TableType<T> extends Table<infer CDef, infer CType, infer KeyType> ? CType : never;
export type ColumnType<T extends Tables, C extends ColumnDef<T>> = TableType<T> extends Table<infer CDef, infer CType, infer KeyType> ? CType[C] : never;

type ChangeCallback = () => void;

const Database = new LocalDatabase();
Database.loadInitialData();

export default Database;

console.log(Database);
console.log(DatabaseTables);