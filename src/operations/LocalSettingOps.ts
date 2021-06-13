import { LocalSettingType } from "../data/LocalSettingType";
import { Tables } from "../database/LocalDatabase";
import { LocalSettingsColumns } from "../database/tables/LocalSettingsTable";
import DatabaseOps from "./DatabaseOps";

const LocalSettingOps = {
  useJobWithPopupOpen(): readonly [string | undefined] {
    const [jobWithPopupOpen] = DatabaseOps.useCellState(Tables.LocalSettings,
      LocalSettingType.JOB_WITH_POPUP_OPEN, LocalSettingsColumns.VALUE);
    return [jobWithPopupOpen] as const;
  },

  requestOpenPopup(jobId: string) {
    DatabaseOps.setCellState(Tables.LocalSettings, LocalSettingType.JOB_WITH_POPUP_OPEN, LocalSettingsColumns.VALUE, jobId);
  },

  closePopup() {
    DatabaseOps.setCellState(Tables.LocalSettings, LocalSettingType.JOB_WITH_POPUP_OPEN, LocalSettingsColumns.VALUE, undefined);
  },
}

export default LocalSettingOps;