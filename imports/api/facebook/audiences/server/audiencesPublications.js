import _ from "underscore";
import { FacebookAudiences } from "../audiences.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";

Meteor.publish("audiences.byCategory.byGeolocation", function({
  campaignId,
  facebookAccountId,
  geolocationId,
  audienceCategoryId
}) {
  const currentUser = this.userId;
  if (currentUser) {
    return FacebookAudiences.find(
      {
        campaignId: campaignId,
        facebookAccountId: facebookAccountId,
        geolocationId: geolocationId,
        audienceCategoryId: audienceCategoryId
      },
      { sort: { createdAt: -1 } }
    );
  } else {
    return this.ready();
  }
});

Meteor.publish("audiences.byCampaignAccount", function({
  campaignId,
  facebookAccountId
}) {
  const userId = this.userId;
  if (userId) {
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      return this.ready();
    }
    return FacebookAudiences.find(
      {
        campaignId,
        facebookAccountId
      },
      { sort: { createdAt: -1 } }
    );
  } else {
    return this.ready();
  }
});

Meteor.publishComposite("audiences.byCategory", function({
  campaignId,
  facebookAccountId,
  audienceCategoryId
}) {
  const userId = this.userId;
  if (userId) {
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      return this.ready();
    }
    return {
      find: function() {
        return FacebookAudiences.find(
          {
            campaignId,
            facebookAccountId,
            audienceCategoryId
          },
          { sort: { createdAt: -1 } }
        );
      },
      children: [
        {
          find: function(audience) {
            return Geolocations.find(
              {
                _id: audience.geolocationId
              },
              { fields: { name: 1 } }
            );
          }
        }
      ]
    };
  } else {
    return this.ready();
  }
});
