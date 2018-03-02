import { Contexts } from "/imports/api/contexts/contexts";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories";

Meteor.publish("audienceCategories.all", function() {
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return AudienceCategories.find({});
  } else {
    return this.ready();
  }
});

Meteor.publish("audienceCategories.detail", function({ audienceCategoryId }) {
  const currentUser = this.userId;
  if (currentUser) {
    return AudienceCategories.find({
      _id: audienceCategoryId
    });
  } else {
    return this.ready();
  }
});

Meteor.publish("audienceCategories.byContext", function({ contextId }) {
  logger.debug("audienceCategories.byContext pub", { contextId });
  const currentUser = this.userId;
  if (currentUser) {
    const context = Contexts.findOne(contextId);
    return AudienceCategories.find({
      _id: { $in: context.audienceCategories }
    });
  } else {
    return this.ready();
  }
});
