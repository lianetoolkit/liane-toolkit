import { Feedback } from "/imports/api/feedback/feedback";

Meteor.publishComposite("feedback.all", function({ query, options }) {
  this.unblock();
  const userId = this.userId;
  if (userId && Roles.userIsInRole(userId, ["admin"])) {
    return {
      find: function() {
        return Feedback.find(
          query || {},
          options || { sort: { createdAt: -1 } }
        );
      }
    };
  }
  return this.ready();
});

Meteor.publishComposite("feedback.detail", function({ feedbackId }) {
  this.unblock();
  const userId = this.userId;
  if (userId && Roles.userIsInRole(userId, ["admin"])) {
    return {
      find: function() {
        return Feedback.find(feedbackId);
      }
    };
  }
  return this.ready();
});
