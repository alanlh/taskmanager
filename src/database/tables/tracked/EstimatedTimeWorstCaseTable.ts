import TrackingTable from "../TrackingTable";

export default class EstimatedTimeWorstCaseTable extends TrackingTable<number> {
  constructor() {
    super({
      tableName: "ESTIMATED_TIME_WORST_CASE",
      defaultValue: 0,
    });
  }
}