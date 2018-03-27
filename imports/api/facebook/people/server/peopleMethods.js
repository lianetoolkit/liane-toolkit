import SimpleSchema from "simpl-schema";
import { People, PeopleIndex } from "../people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { flattenObject } from "/imports/utils/common.js";
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

export const canvasFormUpdate = new ValidatedMethod({
  name: "people.metaUpdate",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    personId: {
      type: String
    },
    sectionKey: {
      type: String
    },
    data: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, personId, sectionKey, data }) {
    logger.debug("people.metaUpdate called", {
      campaignId,
      personId,
      sectionKey,
      data
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    const allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return People.update(
      {
        campaignId,
        _id: personId
      },
      {
        $set: {
          [`campaignMeta.${sectionKey}`]: data
        }
      }
    );
  }
});

export const exportPeople = new ValidatedMethod({
  name: "people.export",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    logger.debug("people.export called", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    const allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const people = People.find(
      { campaignId },
      {
        fields: {
          name: 1,
          facebookId: 1,
          counts: 1,
          campaignMeta: 1
        }
      }
    ).fetch();

    let flattened = [];

    let header = {};

    for (let person of people) {
      if (person.campaignMeta) {
        for (const key in person.campaignMeta) {
          person[key] = person.campaignMeta[key];
        }
        delete person.campaignMeta;
      }
      const flattenedPerson = flattenObject(person);
      for (const key in flattenedPerson) {
        header[key] = true;
      }
      flattened.push(flattenObject(person));
    }

    return Papa.unparse({
      fields: Object.keys(header),
      data: flattened
    });
  }
});
