Meteor.onConnection(function(connection) {
  connection.onClose(function(data) {
    /* TODO  Log this */
    // console.log("disconnecting", connection.id);
  });
});
