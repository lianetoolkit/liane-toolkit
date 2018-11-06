import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Contexts } from "/imports/api/contexts/contexts.js";

Meteor.publish("geolocations.all", function() {
  const currentUser = this.userId;
  if (currentUser) {
    return Geolocations.find(
      {},
      {
        fields: {
          name: 1
        }
      }
    );
  } else {
    return this.ready();
  }
});

Meteor.publish("geolocations.byCampaign", function({ campaignId }) {
  const userId = this.userId;
  if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
    return this.ready();
  } else {
    const campaign = Campaigns.findOne(campaignId);
    const context = Contexts.findOne(campaign.contextId);
    return Geolocations.find(
      {
        _id: { $in: [...context.geolocations, context.mainGeolocationId] }
      },
      {
        fields: {
          name: 1
        }
      }
    );
  }
});

Meteor.publish("geolocations.byContext", function({ contextId }) {
  const currentUser = this.userId;
  if (currentUser) {
    const context = Contexts.get(contextId);
    return Geolocations.find(
      {
        _id: { $in: context.geolocations }
      },
      {
        fields: {
          name: 1
        }
      }
    );
  } else {
    return this.ready();
  }
});

Meteor.publish("geolocations.detail", function({ geolocationId }) {
  const currentUser = this.userId;
  if (currentUser) {
    return Geolocations.find(
      {
        _id: geolocationId
      },
      {
        fields: {
          name: 1,
          type: 1,
          facebook: 1,
          osm: 1,
          center: 1
        }
      }
    );
  } else {
    return this.ready();
  }
});
