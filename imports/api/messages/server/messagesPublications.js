import { Messages } from "/imports/api/messages/messages.js";

Meteor.publish("messages.all", function ({ query, options }) {
  this.unblock();
  const userId = this.userId;
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return Messages.find(query || {}, options || {});
  }
  return this.ready();
});
