import { People, PeopleIndex } from "../people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import _ from "underscore";

Meteor.publish("people.campaignSearch", function({ search, campaignId }) {
  logger.debug("people.campaignSearch called", { search, campaignId });
  check(search, Object);
  check(campaignId, String);
  const userId = this.userId;
  if (userId) {
    const campaign = Campaigns.findOne(campaignId);
    const allowed = _.findWhere(campaign.users, { userId });
    if (allowed) {
      const props = { campaignId };
      const meta = _.omit(search, "name");
      for (const key in meta) {
        if (meta[key]) {
          props[`campaignMeta.${key}`] = meta[key];
        }
      }
      const cursor = PeopleIndex.search(search.name || "", { props });
      return cursor.mongoCursor;
    }
  }
  return this.ready();
});

Meteor.publish("people.detail", function({ personId }) {
  logger.debug("people.detail called", { personId });

  const userId = this.userId;
  if (userId) {
    const person = People.findOne(personId);
    if (person) {
      const campaign = Campaigns.findOne(person.campaignId);
      const allowed = _.findWhere(campaign.users, { userId });
      if (allowed) {
        return People.find({ _id: personId });
      }
    }
  }
  return this.ready();
});

Meteor.publish("people.byAccount", function({
  search,
  limit,
  orderBy,
  fields
}) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser) {
    const options = {
      sort: {},
      limit: Math.min(limit, 1000),
      fields
    };
    options["sort"][orderBy.field] = orderBy.ordering;
    return People.find(search, options);
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("people.byAccount.counter", function({ search }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser) {
    Counts.publish(this, "people.byAccount.counter", People.find(search));
    return;
  } else {
    this.stop();
    return;
  }
});
