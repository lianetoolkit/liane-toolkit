import { AccessLogs } from "/imports/api/accessLogs/accessLogs";

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
