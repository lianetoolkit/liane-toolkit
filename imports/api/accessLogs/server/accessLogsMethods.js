import SimpleSchema from "simpl-schema";
import { AccessLogs } from "../accessLogs";

export const accessLog = new ValidatedMethod({
  name: "log",
  validate: new SimpleSchema({
    type: {
      type: String
    },
    path: {
      type: String,
      optional: true
    }
  }).validator(),
  run({ type, path }) {
    this.unblock();
    if (!this.userId) return;
    let doc = {
      connectionId: this.connection.id,
      ip: this.connection.clientAddress,
      userId: this.userId,
      type
    };
    if (path) {
      doc.path = path;
    }
    AccessLogs.insert(doc);
  }
});
