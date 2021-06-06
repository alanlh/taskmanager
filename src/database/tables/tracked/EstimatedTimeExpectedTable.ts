import TrackingTable from "../TrackingTable";

export default class EstimatedTimeExpectedTable extends TrackingTable<number> {
  constructor() {
    super({
      tableName: "ESTIMATED_TIME_EXPECTED",
      defaultValue: 0,
    });
  }
}