import { useState, useCallback, useEffect, useMemo, useRef, RefObject, MutableRefObject } from "react";
import Database, { Tables, ColumnDef, ColumnType, KeyType, ColumnTypes } from "../database/LocalDatabase";
import { OptionalTuple } from "../database/tables/Table";

const DatabaseOps = {
  useCellState<T extends Tables, C extends ColumnDef<T>>(table: T, key: KeyType<T>, column: C) {
    const [value, setValue] = useState(Database.getCell(table, key, column));

    const onDatabaseChange = useCallback(() => {
      setValue(Database.getCell(table, key, column));
    }, [table, key, column]); // Only the key should be necessary, but let's be safe.

    useEffect(() => {
      Database.addCellListener(table, key, column, onDatabaseChange);

      return () => {
        Database.removeCellListener(table, key, column, onDatabaseChange);
      }
    }, [table, key, column, onDatabaseChange]);

    const setDatabaseValue = useCallback((newValue: ColumnType<T, C>) => {
      Database.setCell(table, key, column, newValue);
    }, [table, key, column]);
    return [value, setDatabaseValue] as const;
  },

  useReadonlyCellState<T extends Tables, C extends ColumnDef<T>>(table: T, key: KeyType<T>, column: C) {
    const [state] = DatabaseOps.useCellState(table, key, column);
    return [state];
  },

  useIndexState<T extends Tables, C extends ColumnDef<T>>(table: T, column: C, value: ColumnType<T, C>): [KeyType<T>[]] {
    const getIndex = useCallback(() => {
      return Database.getIndex(table, column, value)
    }, [table, column, value]);
    const initialValue = useRef<KeyType<T>[]>(null) as MutableRefObject<KeyType<T>[]>;
    if (initialValue.current === null) {
      initialValue.current = getIndex();
    }
    const [indices, setIndices] = useState(initialValue.current);

    const onDatabaseChange = useCallback(() => {
      const newValues = getIndex();
      setIndices(newValues);
    }, [indices, setIndices, getIndex]);

    useEffect(() => {
      // Note: Can't attach to the cells in indices because another row might be set to value. 
      Database.addIndexListener(table, column, value, onDatabaseChange);

      return () => {
        Database.removeIndexListener(table, column, value, onDatabaseChange);
      }
    }, [table, column, value, onDatabaseChange])

    // Users can't change composite data, so don't return a setter.
    return [indices];
  },

  useRelatedIndexState<T extends Tables, CIdx extends ColumnDef<T>, CRel extends ColumnDef<T>>(table: T,
    indexedColumn: CIdx, value: ColumnType<T, CIdx>, relatedColumn: CRel): [(readonly [KeyType<T>, ColumnType<T, CRel>])[]] {

    const getRelatedValues = useCallback(() => {
      const indices = DatabaseOps.getIndexState(table, indexedColumn, value);
      return indices.map((key) => {
        return [key, Database.getCell(table, key, relatedColumn)] as const;
      })
    }, [table, indexedColumn, value, relatedColumn]);
    
    const initialValue = useRef<(readonly [KeyType<T>, ColumnType<T, CRel>])[]>(null) as MutableRefObject<(readonly [KeyType<T>, ColumnType<T, CRel>])[]>;
    if (initialValue.current === null) {
      initialValue.current = getRelatedValues();
    }
    const [relatedValues, setRelatedValues] = useState(initialValue.current);

    const onDatabaseChange = useCallback(() => {
      setRelatedValues(getRelatedValues());
    }, [getRelatedValues, setRelatedValues]);

    useEffect(() => {
      Database.addIndexListener(table, value, indexedColumn, onDatabaseChange);
      for (const [key] of relatedValues) {
        Database.addCellListener(table, key, relatedColumn, onDatabaseChange);
      }

      return () => {
        Database.removeIndexListener(table, value, indexedColumn, onDatabaseChange);
        for (const [key] of relatedValues) {
          Database.removeCellListener(table, key, relatedColumn, onDatabaseChange);
        }
      }
    }, [relatedValues, table, indexedColumn, value, relatedColumn, onDatabaseChange]);

    return [relatedValues];
  },

  createRow<T extends Tables>(table: T, initialValues?: OptionalTuple<ColumnTypes<T>>) {
    return Database.createRow(table, initialValues);
  },

  generateDefaultRow<T extends Tables>(table: T): OptionalTuple<ColumnTypes<T>> {
    return Array(Database.getTableColumnCount(table)).fill(undefined) as OptionalTuple<ColumnTypes<T>>;
  },

  getCellState<T extends Tables, C extends ColumnDef<T>>(table: T, key: KeyType<T>, column: C) {
    return Database.getCell(table, key, column);
  },
  
  setCellState<T extends Tables, C extends ColumnDef<T>>(table: T, key: KeyType<T>, column: C, value: ColumnType<T, C>) {
    Database.setCell(table, key, column, value);
  },

  getIndexState<T extends Tables, C extends ColumnDef<T>>(table: T, column: C, value: ColumnType<T, C>) {
    return Database.getIndex(table, column, value);
  }
}

export default DatabaseOps;