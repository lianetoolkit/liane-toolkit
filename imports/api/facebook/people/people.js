import SimpleSchema from "simpl-schema";
import { Index, MongoDBEngine } from "meteor/easy:search";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

const People = new Mongo.Collection("people");
const PeopleIndex = new Index({
  collection: People,
  fields: ["name"],
  defaultSearchOptions: {
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
          return {};
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
    type: String,
    index: "text"
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
    optional: true,
    index: 1
  },
  "facebookAccounts.$": {
    type: String
  },
  counts: {
    type: Object,
    blackbox: true,
    optional: true
  },
  createdAt: {
    type: Date,
    index: 1,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        return this.unset();
      }
    }
  },
  updatedAt: {
    type: Date,
    index: 1,
    autoValue() {
      return new Date();
    }
  }
});

People.attachSchema(People.schema);

if (Meteor.isServer) {
  People._ensureIndex({
    name: "text"
  });
}

exports.People = People;
exports.PeopleIndex = PeopleIndex;
