import { Accounts } from "meteor/accounts-base";
import { AccessLogs } from "/imports/api/accessLogs/accessLogs";
import axios from "axios";

if (Meteor.settings.public.deployMode !== "local") {
  Accounts.onLogin(function(data) {
    const ip = data.connection.clientAddress;
    let insertDoc = {
      ip,
      type: "open",
      userId: data.user._id,
      connectionId: data.connection.id
    };
    let geoData = false;
    axios
      .get(`https://get.geojs.io/v1/country/${ip}.json`)
      .then(res => {
        geoData = res.data;
      })
      .finally(() => {
        if (geoData && geoData.country) insertDoc.country = geoData.country;
        AccessLogs.insert(insertDoc);
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
