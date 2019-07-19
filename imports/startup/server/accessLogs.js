import { Accounts } from "meteor/accounts-base";
import { AccessLogs } from "/imports/api/accessLogs/accessLogs";

if (Meteor.settings.public.deployMode !== "local") {
  Accounts.onLogin(function(data) {
    AccessLogs.insert({
      type: "open",
      userId: data.user._id,
      connectionId: data.connection.id,
      ip: data.connection.clientAddress
    });
  });

  Meteor.onConnection(function(connection) {
    connection.onClose(function(data) {
      const lastLog = AccessLogs.findOne({
        connectionId: connection.id,
        type: "view"
      });
      if (lastLog) {
        AccessLogs.insert({
          type: "close",
          ip: lastLog.ip,
          userId: lastLog.userId,
          connectionId: connection.id
        });
      }
    });
  });
}
