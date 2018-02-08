import { People, PeopleIndex } from "../people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

Meteor.publish("people.campaignSearch", function({ search, campaignId }) {
  logger.debug("people.campaignSearch called", { search, campaignId });
  // check(search, String);
  // check(campaignId, String);
  const userId = this.userId;
  if (userId) {
    const campaign = Campaigns.findOne(campaignId);
    const allowed = _.findWhere(campaign.users, { userId });
    if (allowed) {
      const cursor = PeopleIndex.search(search, { props: { campaignId } });
      console.log("result", cursor.fetch());
      return cursor.mongoCursor;
    } else {
      console.log("not allowed");
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
