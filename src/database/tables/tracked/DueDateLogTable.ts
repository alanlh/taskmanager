import TrackingTable from "../TrackingTable";

export default class DueDateLogTable extends TrackingTable<Date> {
  constructor() {
    super({
      tableName: "DUE_DATE_LOG",
      defaultValueGenerator: () => new Date(),
    });
  }
}

