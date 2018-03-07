import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { People } from "/imports/api/facebook/people/people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import PeopleSinglePage from "/imports/ui/pages/people/PeopleSinglePage.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });
  const personHandle = Meteor.subscribe("people.detail", {
    personId: props.personId
  });
  const likesHandle = Meteor.subscribe("likes.byPerson", {
    personId: props.personId,
    campaignId: props.campaignId
  });
  const commentsHandle = Meteor.subscribe("comments.byPerson", {
    personId: props.personId,
    campaignId: props.campaignId
  });

  const campaignOptions = {
    transform: function(campaign) {
      campaign.accounts = FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch();
      return campaign;
    }
  };

  const entriesOptions = {
    transform: function(item) {
      item.entry = Entries.findOne(item.entryId);
      return item;
    }
  };

  const loading =
    !subsHandle.ready() ||
    !personHandle.ready() ||
    !likesHandle.ready() ||
    !commentsHandle.ready();

  const campaign = subsHandle.ready()
    ? Campaigns.findOne(props.campaignId, campaignOptions)
    : null;

  const accounts = subsHandle.ready() ? FacebookAccounts.find().fetch() : [];

  const person = personHandle.ready() ? People.findOne(props.personId) : null;

  const likes = likesHandle.ready()
    ? Likes.find({}, entriesOptions).fetch()
    : null;
  const comments = commentsHandle.ready()
    ? Comments.find({}, entriesOptions).fetch()
    : null;

  return {
    loading,
    campaign,
    person,
    likes,
    comments
  };
}, PeopleSinglePage);
