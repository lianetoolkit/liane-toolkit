import { Contexts } from "/imports/api/contexts/contexts.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";

Meteor.publish("contexts.all", function() {
  const currentUser = this.userId;
  if (currentUser) {
    return Contexts.find();
  } else {
    return this.ready();
  }
});

Meteor.publishComposite("admin.contexts.detail", function({ contextId }) {
  const currentUser = this.userId;
  logger.debug("admin.contexts.detail pub", { contextId });
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return {
      find: function() {
        return Contexts.find({
          _id: contextId
        });
      }
    };
  } else {
    return this.ready();
  }
});

Meteor.publishComposite("admin.contexts", function() {
  const currentUser = this.userId;

  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return {
      find: function() {
        return Contexts.find();
      },
      children: [
        {
          find: function(context) {
            return Campaigns.find({
              contextId: context._id
            });
          }
        },
        {
          find: function(context) {
            return Geolocations.find({
              _id: context.mainGeolocationId
            });
          }
        }
      ]
    };
  } else {
    return this.ready();
  }
});
