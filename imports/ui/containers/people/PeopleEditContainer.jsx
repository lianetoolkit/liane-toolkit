import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { People } from "/imports/api/facebook/people/people.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import PeopleEdit from "/imports/ui/pages/people/PeopleEdit.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });
  const personHandle = Meteor.subscribe("people.detail", {
    personId: props.personId
  });

  const campaignOptions = {
    transform: function(campaign) {
      campaign.accounts = FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch();
      return campaign;
    }
  };

  const loading = !subsHandle.ready() || !personHandle.ready();

  const campaign = subsHandle.ready()
    ? Campaigns.findOne(props.campaignId, campaignOptions)
    : null;

  const accounts = subsHandle.ready() ? FacebookAccounts.find().fetch() : [];

  const person = personHandle.ready() ? People.findOne(props.personId) : null;

  return {
    loading,
    campaign,
    person
  };
}, PeopleEdit);
