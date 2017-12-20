import { People } from "../people.js";

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
