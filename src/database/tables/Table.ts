import { Tables, TrackedTables } from "../LocalDatabase";
import TrackingTable from "./TrackingTable";

export default abstract class Table<CDef extends number, CType extends any[], KeyType> {
  public readonly tableName: string;
  private _columnNames: Record<CDef, string>;

  public readonly columnCount: number;
  
  public readonly keyColumn: CDef;

  private readonly defaultValues: CType;
  
  public indexedColumns: ReadonlySet<CDef> = new Set();
  public _indices: Map<CDef, Map<any, Set<KeyType>>> = new Map();

  protected _data: Map<KeyType, CType> = new Map();

  public readonly trackingTables: ReadonlyMap<CDef, TrackedTables>;

  public constructor({ tableName, columnNames, columnCount, keyColumn, indexedColumns, defaultValues, trackingTables}: TableParameters<CDef, CType>) {
    this.tableName = tableName;
    this._columnNames = columnNames;
    this.columnCount = columnCount;

    this.keyColumn = keyColumn;
    this.indexedColumns = new Set(indexedColumns);
    for (const column of indexedColumns) {
      this._indices.set(column, new Map());
    }

    this.defaultValues = defaultValues;

    this.trackingTables = trackingTables;
  }

  public onLoad() {
    
  }

  public getColumnName(column: CDef): string {
    return this._columnNames[column];
  }

  public checkRowExists(key: KeyType): boolean {
    return this._data.has(key);
  }

  public getData<T extends CDef>(key: KeyType, column: T): CType[T] {
    const row = this._data.get(key);
    return row ? row[column] : undefined;
  }

  public setData<T extends CDef>(key: KeyType, column: T, value: CType[T]): void {
    const row = this._data.get(key);
    if (!row) {
      return;
    }
    const isIndexed = this.checkIndexed(column);
    if (isIndexed) {
      const prevValue = row[column];
      this.removeFromIndex(column, prevValue, key);
    }
    row[column] = value;
    if (isIndexed) {
      this.addToIndex(column, value, key);
    }
  }

  checkIndexed(column: CDef) {
    return this.indexedColumns.has(column);
  }

  public hasRowWithIndex<T extends CDef>(column: T, value: CType[T]): boolean {
    if (!this.checkIndexed(column)) {
      console.warn(`Table ${this.tableName} does not have an index on column ${this.getColumnName(column)}.`);
      return false;
    }
    return this._indices.get(column)!.has(value);
  }

  public getRowsWithIndex<T extends CDef>(column: T, value: CType[T]): KeyType[] {
    if (!this.indexedColumns.has(column)) {
      console.warn(`Table ${this.tableName} does not have an index on column ${this.getColumnName(column)}.`);
      return [];
    }
    return Array.from(this._indices.get(column)!.get(value) || []);
  }

  private getIndexSet<T extends CDef>(column: T, value: CType[T] | undefined): Set<KeyType> | undefined {
    return this._indices.get(column)!.get(value);
  }

  private addToIndex<T extends CDef>(column: CDef, value: CType[T] | undefined, key: KeyType): void {
    let set = this.getIndexSet(column, value);
    if (set === undefined) {
      set = new Set();
      this._indices.get(column)!.set(value, set);
    }
    set.add(key);
  }

  private removeFromIndex<T extends CDef>(column: CDef, value: CType[T] | undefined, key: KeyType): void {
    let set = this.getIndexSet(column, value)!;
    set.delete(key);
    if (set.size === 0) {
      this._indices.get(column)!.delete(value);
    }
  }

  /**
   * Creates a new row in the database with all values empty except for a key.
   */
  public createRow(initialValues?: OptionalTuple<CType>): KeyType {
    const row = Array.from(this.defaultValues) as CType;
    if (initialValues !== undefined) {
      for (let i = 0; i < row.length; i++) {
        if (initialValues[i] !== undefined) {
          row[i] = initialValues[i];
        }
      }
    }
    let key: KeyType;
    if (initialValues === undefined ||
      initialValues[this.keyColumn] === undefined ||
      this._data.has(row[this.keyColumn])) {
      // Set a default key if the user didn't provide one or if the key already exists.
      key = this.getUniqueKey();
      row[this.keyColumn] = key;
    } else {
      key = row[this.keyColumn];
    }
    this._data.set(key, row);
    for (const column of this.indexedColumns) {
      this.addToIndex(column, row[column], key);
    }
    return key;
  }

  /**
   * Copied from https://stackoverflow.com/a/2117523
   * @returns An almost unique identifier
   */
  protected abstract getUniqueKey(): KeyType;

  protected getUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }
}

interface TableParameters<CDef extends number, CType extends any[]> {
  tableName: string,
  columnCount: number,
  columnNames: Record<CDef, string>, // Use record because iterating can be done using numbers.
  keyColumn: CDef,
  defaultValues: CType,
  indexedColumns: Iterable<CDef>,
  trackingTables: Map<CDef, TrackedTables>,
};

export type OptionalTuple<T extends any[]> =
  T extends [infer P1] ? [P1?] :
  T extends [infer P1, infer P2] ? [P1?, P2?] :
  T extends [infer P1, infer P2, infer P3] ? [P1?, P2?, P3?] :
  T extends [infer P1, infer P2, infer P3, infer P4] ? [P1?, P2?, P3?, P4?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5] ? [P1?, P2?, P3?, P4?, P5?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6] ? [P1?, P2?, P3?, P4?, P5?, P6?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7] ? [P1?, P2?, P3?, P4?, P5?, P6?, P7?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7, infer P8] ? [P1?, P2?, P3?, P4?, P5?, P6?, P7?, P8?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7, infer P8, infer P9] ? [P1?, P2?, P3?, P4?, P5?, P6?, P7?, P8?, P9?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7, infer P8, infer P9, infer P10] ? [P1?, P2?, P3?, P4?, P5?, P6?, P7?, P8?, P9?, P10?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7, infer P8, infer P9, infer P10, infer P11] ? [P1?, P2?, P3?, P4?, P5?, P6?, P7?, P8?, P9?, P10?, P11?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7, infer P8, infer P9, infer P10, infer P11, infer P12] ? [P1?, P2?, P3?, P4?, P5?, P6?, P7?, P8?, P9?, P10?, P11?, P12?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7, infer P8, infer P9, infer P10, infer P11, infer P12, infer P13] ? [P1?, P2?, P3?, P4?, P5?, P6?, P7?, P8?, P9?, P10?, P11?, P12?, P13?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7, infer P8, infer P9, infer P10, infer P11, infer P12, infer P13, infer P14] ? [P1?, P2?, P3?, P4?, P5?, P6?, P7?, P8?, P9?, P10?, P11?, P12?, P13?, P14?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7, infer P8, infer P9, infer P10, infer P11, infer P12, infer P13, infer P14, infer P15] ? [P1?, P2?, P3?, P4?, P5?, P6?, P7?, P8?, P9?, P10?, P11?, P12?, P13?, P14?, P15?] :
  T extends [infer P1, infer P2, infer P3, infer P4, infer P5, infer P6, infer P7, infer P8, infer P9, infer P10, infer P11, infer P12, infer P13, infer P14, infer P15, infer P16] ? [P1?, P2?, P3?, P4?, P5?, P6?, P7?, P8?, P9?, P10?, P11?, P12?, P13?, P14?, P15?, P16?] : never;