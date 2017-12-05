import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories";

Meteor.publish("audiences.categories.all", function() {
  const currentUser = this.userId;
  if (currentUser) {
    return AudienceCategories.find({});
  } else {
    return this.ready();
  }
});

Meteor.publish("audiences.categories.byContext", function({ contextId }) {
  logger.debug("audiences.categories.byContext pub", { contextId });
  const currentUser = this.userId;
  if (currentUser) {
    return AudienceCategories.find({
      contextIds: { $in: [contextId] }
    });
  } else {
    return this.ready();
  }
});
