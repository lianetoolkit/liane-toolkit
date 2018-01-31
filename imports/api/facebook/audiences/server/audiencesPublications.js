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
    const campaign = Campaigns.findOne(campaignId);
    if (!_.findWhere(campaign.users, { userId })) {
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
    const campaign = Campaigns.findOne(campaignId);
    if (!_.findWhere(campaign.users, { userId })) {
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

Meteor.publishComposite("audiences.byAccount", function({
  search,
  limit,
  orderBy,
  fields
}) {
  this.unblock();
  // Meteor._sleepForMs 2000
  const currentUser = this.userId;
  if (currentUser) {
    const options = {
      sort: {},
      limit: Math.min(limit, 1000),
      fields
    };
    options["sort"][orderBy.field] = orderBy.ordering;

    return {
      find: function() {
        return FacebookAudiences.find(search, options);
      },
      children: [
        {
          find: function(fbAudience) {
            return AudienceCategories.find(
              {
                _id: fbAudience.audienceCategoryId
              },
              { fields: { title: 1 } }
            );
          }
        },
        {
          find: function(fbAudience) {
            return Geolocations.find(
              {
                _id: fbAudience.geolocationId
              },
              { fields: { name: 1 } }
            );
          }
        }
      ]
    };
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("audiences.byAccount.counter", function({ search }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser) {
    Counts.publish(
      this,
      "audiences.byAccount.counter",
      FacebookAudiences.find(search)
    );
    return;
  } else {
    this.stop();
    return;
  }
});
