import TrackingTable from "../TrackingTable";

export default class TimeLogHistoryTable extends TrackingTable<number> {
  constructor() {
    super({
      tableName: "TIME_LOG_HISTORY",
      defaultValue: 0,
    });
  }
}