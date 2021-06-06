import LocalDatabase, { Tables } from "../database/LocalDatabase";
import { StatusDefinitionColumn } from "../database/tables/StatusDefinitionTable";
import DatabaseOps from "./DatabaseOps";

const StatusDefinitionOps = {
  useStatusName(statusType: string, key: string) {
    const type = LocalDatabase.getCell(Tables.StatusDefinitions, key, StatusDefinitionColumn.TYPE);
    console.assert(type !== undefined, "No status definition with key ", key, " exists");
    console.assert(type === statusType, "The status definition key ", key, " does not belong to type", statusType);
    return DatabaseOps.useCellState(Tables.StatusDefinitions, key, StatusDefinitionColumn.NAME);
  },

  /**
   * Returns a list of all possible values for a particular status.
   * @param statusType The type of status to retrieve
   * @returns List of all status values
   */
  useAllStatusValuesAndNames(statusType: string) {
    return DatabaseOps.useRelatedIndexState(Tables.StatusDefinitions, StatusDefinitionColumn.TYPE, statusType, StatusDefinitionColumn.NAME);
  },
}

export default StatusDefinitionOps;