import { Feedback } from "/imports/api/feedback/feedback";

Meteor.publish("feedback.all", function() {
  this.unblock();
  const userId = this.userId;
  if (userId && Roles.userIsInRole(userId, ["admin"])) {
    return Feedback.find();
  }
  return this.ready();
});
