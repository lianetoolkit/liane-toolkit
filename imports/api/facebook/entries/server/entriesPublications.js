import { Entries } from "../entries.js";

Meteor.publish("entries.byAccount", function({
  search,
  limit,
  orderBy,
  fields
}) {
  this.unblock();
  // Meteor._sleepForMs 2000
  const currentUser = this.userId;
  if (currentUser && search.facebookAccountId) {
    const options = {
      sort: {},
      limit: Math.min(limit, 1000),
      fields
    };
    options["sort"][orderBy.field] = orderBy.ordering;
    return Entries.find(search, options);
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("entries.byAccount.counter", function({ search }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser) {
    Counts.publish(this, "entries.byAccount.counter", Entries.find(search));
    return;
  } else {
    this.stop();
    return;
  }
});
