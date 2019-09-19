import { Feedback } from "/imports/api/feedback/feedback";

Meteor.publishComposite("feedback.all", function({ query, options }) {
  this.unblock();
  const userId = this.userId;
  console.log({query, options});
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
