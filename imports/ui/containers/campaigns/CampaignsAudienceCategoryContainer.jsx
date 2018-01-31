import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import CampaignsAudienceCategory from "/imports/ui/pages/campaigns/CampaignsAudienceCategory.jsx";
import _ from "underscore";

const audienceCategory = new ReactiveVar(null);

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });

  const audienceHandle = Meteor.subscribe("audiences.byCategory", {
    campaignId: props.campaignId,
    facebookAccountId: props.facebookId,
    audienceCategoryId: props.categoryId
  });

  const options = {
    sort: { createdAt: -1 },
    transform: function(audience) {
      audience.geolocation = Geolocations.find({
        _id: audience.geolocationId
      }).fetch()[0];
      return audience;
    }
  };

  const loading = !subsHandle.ready() || !audienceHandle.ready();

  const campaign = subsHandle.ready()
    ? Campaigns.findOne(props.campaignId)
    : null;
  const accounts = campaign
    ? FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch()
    : [];
  const audiences = audienceHandle.ready()
    ? FacebookAudiences.find(
        {
          campaignId: props.campaignId,
          facebookAccountId: props.facebookId,
          audienceCategoryId: props.categoryId
        },
        options
      ).fetch()
    : [];
  const geolocations = audienceHandle.ready()
    ? Geolocations.find().fetch()
    : [];

  Meteor.call(
    "audienceCategories.get",
    {
      audienceCategoryId: props.categoryId
    },
    (error, data) => {
      if (error) {
        console.warn(error);
      }
      if (JSON.stringify(audienceCategory.get()) !== JSON.stringify(data)) {
        audienceCategory.set(data);
      }
    }
  );

  return {
    loading,
    campaign,
    accounts,
    audienceCategory: audienceCategory.get(),
    audiences
  };
}, CampaignsAudienceCategory);
