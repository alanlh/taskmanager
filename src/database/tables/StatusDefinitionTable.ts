import { CompletionStatusType, CompletionStatus, getCompletionStatusKey, getCompletionStatusName } from "../../data/CompletionStatus";
import Table, { GenericColumnDefParams } from "./Table";

export enum StatusDefinitionColumn {
  KEY, TYPE, NAME, DESCRIPTION,

  __LENGTH
}

type ValidStatusDefinitionColumn = Exclude<StatusDefinitionColumn, StatusDefinitionColumn.__LENGTH>;

type StatusDefinitionColumnTypes = [string, string, string, string];

export default class StatusDefinitionTable extends Table<ValidStatusDefinitionColumn,
  StatusDefinitionColumnTypes, StatusDefinitionColumnTypes[StatusDefinitionColumn.KEY]> {
  
  constructor() {
    super({
      tableName: "STATUS_DEFINTIIONS",
      columnParams: {
        [StatusDefinitionColumn.KEY]: {
          defaultValueGenerator: () => this.getUniqueKey(),
          indexed: true,
        },
        [StatusDefinitionColumn.TYPE]: {
          indexed: true,
          defaultValueGenerator: () => "",
        },
        [StatusDefinitionColumn.NAME]: {
          defaultValueGenerator: () => "",
        },
        [StatusDefinitionColumn.DESCRIPTION]: {
          defaultValueGenerator: () => "",
        } 
      },
      keyColumn: StatusDefinitionColumn.KEY,
      columnEnum: StatusDefinitionColumn,
    })
  }

  public onLoad() {
    this.createRow([getCompletionStatusKey(CompletionStatus.Planned), CompletionStatusType, getCompletionStatusName(CompletionStatus.Planned), "Planned Description"]);
    this.createRow([getCompletionStatusKey(CompletionStatus.InProgress), CompletionStatusType, getCompletionStatusName(CompletionStatus.InProgress), "In Progress Description"]);
    this.createRow([getCompletionStatusKey(CompletionStatus.Completed), CompletionStatusType, getCompletionStatusName(CompletionStatus.Completed), "Completed Description"]);
    this.createRow([getCompletionStatusKey(CompletionStatus.Void), CompletionStatusType, getCompletionStatusName(CompletionStatus.Void), "Void Description"]);
  }
  
  protected getUniqueKey(): string {
    return this.getUuid();
  }

}