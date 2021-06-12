import TrackingTable from "../TrackingTable";

export default class StatusLogTable extends TrackingTable<string> {
  constructor() {
    super({
      tableName: "STATUS_TABLE_LOG",
      defaultValueGenerator: () => "",
    })
  }
}