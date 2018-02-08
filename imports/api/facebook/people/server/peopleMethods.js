import SimpleSchema from "simpl-schema";
import { People, PeopleIndex } from "../people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import _ from "underscore";

export const updatePersonMeta = new ValidatedMethod({
  name: "facebook.people.updatePersonMeta",
  validate: new SimpleSchema({
    personId: {
      type: String
    },
    metaKey: {
      type: String
    },
    metaValue: {
      type: Match.OneOf(String, Boolean)
    }
  }).validator(),
  run({ personId, metaKey, metaValue }) {
    logger.debug("facebook.people.updatePersonMeta called", {
      personId,
      metaKey,
      metaValue
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const person = People.findOne(personId);

    if (!person) {
      throw new Meteor.Error(401, "Person not found");
    }

    const campaign = Campaigns.findOne(person.campaignId);

    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let doc = {};
    doc[`campaignMeta.${metaKey}`] = metaValue;
    return People.update({ _id: person._id }, { $set: doc });
  }
});

export const peopleCampaignSummary = new ValidatedMethod({
  name: "people.campaignSummary",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookAccountId: {
      type: String
    }
  }).validator(),
  run({ campaignId, facebookAccountId }) {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let result = {};

    result.totalPeople = People.find({
      campaignId,
      facebookAccounts: { $in: [facebookAccountId] }
    }).count();
    result.topLikers = People.find(
      { campaignId, facebookAccounts: { $in: [facebookAccountId] } },
      {
        sort: { [`counts.${facebookAccountId}.likes`]: -1 },
        limit: 10
      }
    ).fetch();
    result.topCommenters = People.find(
      { campaignId, facebookAccounts: { $in: [facebookAccountId] } },
      {
        sort: { [`counts.${facebookAccountId}.comments`]: -1 },
        limit: 10
      }
    ).fetch();

    return result;
  }
});

export const peopleCampaignSearch = new ValidatedMethod({
  name: "people.campaignSearch",
  validate: new SimpleSchema({
    search: {
      type: String
    },
    campaignId: {
      type: String
    }
  }).validator(),
  run({ search, campaignId }) {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return PeopleIndex.search(search, { props: { campaignId } }).fetch();
  }
});
