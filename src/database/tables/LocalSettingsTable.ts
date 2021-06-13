import { LocalSettingType } from "../../data/LocalSettingType";
import Table from "./Table";

export enum LocalSettingsColumns {
  SETTING_TYPE, VALUE,

  __LENGTH,
}

type ValidLocalSettingColumn = Exclude<LocalSettingsColumns, LocalSettingsColumns.__LENGTH>;

type LocalSettingColumnType = [
  LocalSettingType, any
]

export default class LocalSettingsTable extends Table<ValidLocalSettingColumn, LocalSettingColumnType, LocalSettingColumnType[LocalSettingsColumns.SETTING_TYPE]> {
  public constructor() {
    super({
      tableName: "LOCAL_SETTINGS_TABLE",
      keyColumn: LocalSettingsColumns.SETTING_TYPE,
      columnEnum: LocalSettingsColumns,
      columnParams: {
        [LocalSettingsColumns.SETTING_TYPE]: {
          
        },
        [LocalSettingsColumns.VALUE]: {
          
        }
      }
    });
  }
  
  protected getUniqueKey(): boolean {
    throw new Error("Method not implemented.");
  }

  public onLoad() {
    this.createRow([LocalSettingType.JOB_WITH_POPUP_OPEN, undefined]);
  }
}