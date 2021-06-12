import TrackingTable from "../TrackingTable";

export default class EstimatedTimeBestCaseTable extends TrackingTable<number> {
  constructor() {
    super({
      tableName: "ESTIMATED_TIME_BEST_CASE",
      defaultValueGenerator: () => 0,
    });
  }
}