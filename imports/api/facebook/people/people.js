import SimpleSchema from "simpl-schema";
import { Index, MongoDBEngine } from "meteor/easy:search";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

const People = new Mongo.Collection("people");
const PeopleIndex = new Index({
  collection: People,
  fields: ["name", "campaignMeta"],
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
      if (options.search.props && options.search.props.campaignId)
        selector = { ...selector, ...options.search.props };
      return selector;
    },
    sort: function(searchObject, options) {
      const sortBy = options.search.props.sortBy || options.search.sortBy;
      if ("name" === sortBy) {
        return {
          name: 1
        };
      } else {
        throw new Meteor.Error("Invalid sort by prop passed");
      }
    }
  }),
  permission: options => {
    console.log(options);
    const campaignId = options.props.campaignId;
    if (options.userId && campaignId) {
      const campaign = Campaigns.findOne(campaignId);
      return _.findWhere(campaign.users, { userId: options.userId });
    }
    return false;
    console.log(user);
  }
});

People.schema = new SimpleSchema({
  facebookId: {
    type: String,
    index: 1
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
