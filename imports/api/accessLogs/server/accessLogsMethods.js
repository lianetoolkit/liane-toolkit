import SimpleSchema from "simpl-schema";
import { AccessLogs } from "../accessLogs";

export const accessLog = new ValidatedMethod({
  name: "log",
  validate: new SimpleSchema({
    type: {
      type: String,
    },
    path: {
      type: String,
      optional: true,
    },
    campaignId: {
      type: String,
    },
    data: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ type, path, campaignId, data }) {
    this.unblock();
    // if (Meteor.settings.public.deployMode !== "local") {
    if (!this.userId) return;
    let doc = {
      connectionId: this.connection.id,
      ip: this.connection.clientAddress,
      userId: this.userId,
      campaignId,
      type,
    };
    if (path) {
      doc.path = path;
    }
    if (data) {
      doc.data = data;
    }
    AccessLogs.insert(doc);
    // }
  },
});
