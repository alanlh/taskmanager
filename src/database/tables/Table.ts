import { ArrayToRecord, DefaultValueGeneratorArray, OptionalTuple } from "../../utility/Types";
import { TrackedTables } from "../LocalDatabase";

export default abstract class Table<CDef extends number, CType extends any[], KeyType> {
  public readonly tableName: string;
  public readonly columnCount: number;
  public readonly keyColumn: CDef;
  public readonly columnEnum: Record<number, string> & { "__LENGTH": number };

  public readonly columnNames: Record<CDef, string> = [];

  public readonly columnParams: GenericColumnDefParams<CType>;

  public readonly defaultValueGenerators: OptionalTuple<DefaultValueGeneratorArray<CType>>;
  public readonly indexedColumns: Set<CDef> = new Set();
  public readonly trackingTables: ReadonlyMap<CDef, TrackedTables> = new Map();
  
  protected _data: Map<KeyType, CType> = new Map();

  public _indices: Map<CDef, Map<any, Set<KeyType>>> = new Map();

  public constructor({ tableName, keyColumn, columnParams, columnEnum }: TableParameters<CDef, CType>) {
    this.tableName = tableName;
    this.columnCount = columnEnum.__LENGTH;
    this.keyColumn = keyColumn;
    this.columnParams = columnParams;
    this.columnEnum = columnEnum;

    this.defaultValueGenerators = [] as unknown as OptionalTuple<DefaultValueGeneratorArray<CType>>;
    
    for (let column = 0; column < this.columnCount; column++) {
      const columnData = this.getColumnData(column as CDef);

      (this.columnNames as string[]).push(columnData.columnName ? columnData.columnName : columnEnum[column]);

      if (columnData.indexed) {
        this.indexedColumns.add(column as CDef);
        this._indices.set(column as CDef, new Map());
      }

      this.defaultValueGenerators.push(columnData.defaultValueGenerator); // i hate typescript
      
      if (columnData.trackingTable) {
        (this.trackingTables as Map<CDef, TrackedTables>).set(column as CDef, columnData.trackingTable);
      }
    }
  }

  public onLoad() {
    
  }

  //#region Table metadata

  protected getColumnData<T extends CDef>(column: T): ColumnDefParams<CType[T]> {
    return this.columnParams[column as never] as unknown as ColumnDefParams<CType[T]>
  }

  public getColumnName(column: CDef): string {
    return this.columnNames[column];
  }

  private checkIndexed(column: CDef) {
    return this.indexedColumns.has(column);
  }

  //#endregion Table metadata

  //#region Data getters/setters
  
  public checkRowExists(key: KeyType): boolean {
    return this._data.has(key);
  }

  public getData<T extends CDef>(key: KeyType, column: T): CType[T] | undefined {
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

  /**
   * Creates a new row in the database with all values empty except for a key.
   */
  public createRow(initialValues?: OptionalTuple<CType>): KeyType {
    const row = this.defaultValueGenerators.map((generator) => generator ? generator() : undefined) as CType;
    if (initialValues !== undefined) {
      for (let i = 0; i < row.length; i++) {
        if (initialValues[i as CDef] !== undefined) {
          row[i] = initialValues[i as CDef];
          continue;
        }
        if (this.defaultValueGenerators[i] === undefined) {
          console.error("Unable to create row. Column ", this.columnEnum[i], " in table ", this.tableName, " does not have a default value.");
        }
      }
    }

    // At this point, every cell in the row should have a value. Now just make sure that the key is unique.
    let key: KeyType = row[this.keyColumn];
    if (this._data.has(key)) {
      console.error("Key", key, "already exists for table", this.tableName);
    }
    this._data.set(key, row);
    for (const column of this.indexedColumns) {
      this.addToIndex(column, row[column], key);
    }
    return key;
  }

  //#endregion Data getters/setters

  //#region Index manipulation

  public hasRowWithIndex<T extends CDef>(column: T, value: CType[T]): boolean {
    if (!this.checkIndexed(column)) {
      console.warn(`Table ${this.tableName} does not have an index on column ${this.getColumnName(column)}.`);
      return false;
    }
    return this._indices.get(column)!.has(value);
  }

  public getRowsWithIndex<T extends CDef>(column: T, value: CType[T]): KeyType[] {
    if (!this.checkIndexed(column)) {
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

  //#endregion Index manipulation

  //#region Loading and Saving

  protected static toStringDate(date: Date): string {
    // TODO: Fix later.
    return date.toUTCString();
  }

  protected static fromStringDate(string: string): Date {
    // TODO: Probably incorrect, fix later.
    return new Date(Date.parse(string));
  }

  protected static identityString(string: string): string {
    return string;
  }

  //#endregion Loading and Saving

  /**
   * Copied from https://stackoverflow.com/a/2117523
   * @returns An almost unique identifier
   */
  protected getUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }
}

interface TableParameters<CDef extends number, CType extends any[]> {
  tableName: string,
  columnParams: GenericColumnDefParams<CType>,
  keyColumn: CDef,
  columnEnum: Record<number, string> & {"__LENGTH": number},
};

type ColumnDefParams<T> = {
  columnName?: string,
  defaultValueGenerator?: () => T,
  trackingTable?: TrackedTables,
  indexed?: boolean,
  // toString: (val: T) => string,
  // fromString: (val: string) => T,
};

export type GenericColumnDefParams<CType extends any[]> = ArrayToRecord<
{
  [K in keyof CType]: ColumnDefParams<CType[K]>
}>;