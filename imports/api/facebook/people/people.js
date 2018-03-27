import SimpleSchema from "simpl-schema";
import { Index, MongoDBEngine } from "meteor/easy:search";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

const People = new Mongo.Collection("people");
const PeopleIndex = new Index({
  collection: People,
  fields: ["name"],
  defaultSearchOptions: {
    sortBy: "name",
    limit: 10
  },
  engine: new MongoDBEngine({
    selector: function(searchObject, options, aggregation) {
      let selector = this.defaultConfiguration().selector(
        searchObject,
        options,
        aggregation
      );
      for (const key in options.search.props) {
        if (key == "campaignId" || key.indexOf("campaignMeta.") == 0) {
          selector[key] = options.search.props[key];
        }
      }
      return selector;
    },
    sort: function(searchObject, options) {
      const sortBy = options.search.props.sortBy || options.search.sortBy;
      const { facebookId } = options.search.props;
      switch (sortBy) {
        case "name":
          return {
            name: 1
          };
        case "comments":
          if (facebookId) {
            return {
              [`counts.${facebookId}.comments`]: -1
            };
          } else {
            throw new Meteor.Error("Facebook ID is required");
          }
        case "reactions":
          if (facebookId) {
            return {
              [`counts.${facebookId}.likes`]: -1
            };
          } else {
            throw new Meteor.Error("Facebook ID is required");
          }
        default:
          throw new Meteor.Error("Invalid sort by prop passed");
      }
    }
  }),
  permission: options => {
    const campaignId = options.props.campaignId;
    if (options.userId && campaignId) {
      const campaign = Campaigns.findOne(campaignId);
      return _.findWhere(campaign.users, { userId: options.userId });
    }
    return false;
  }
});

People.schema = new SimpleSchema({
  facebookId: {
    type: String,
    index: 1,
    optional: true
  },
  name: {
    type: String
  },
  campaignId: {
    type: String,
    index: 1
  },
  campaignMeta: {
    type: Object,
    blackbox: true,
    optional: true
  },
  facebookAccounts: {
    type: Array,
    optional: true
  },
  "facebookAccounts.$": {
    type: String
  },
  counts: {
    type: Object,
    blackbox: true,
    optional: true
  }
});

People.attachSchema(People.schema);

exports.People = People;
exports.PeopleIndex = PeopleIndex;
