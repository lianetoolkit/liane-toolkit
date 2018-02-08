import SimpleSchema from "simpl-schema";
import { Index, MongoDBEngine } from "meteor/easy:search";

const People = new Mongo.Collection("people");
const PeopleIndex = new Index({
  collection: People,
  fields: ["name"],
  engine: new MongoDBEngine({
    selector: function(searchObject, options, aggregation) {
      let selector = this.defaultConfiguration().selector(
        searchObject,
        options,
        aggregation
      );
      if (options.search.props && options.search.props.campaignId)
        selector.campaignId = options.search.props.campaignId;
      return selector;
    }
  })
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
