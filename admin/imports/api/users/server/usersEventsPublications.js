import { UsersEvents } from "/imports/api/users/usersEvents.js";

Meteor.publish("admin.usersEvents", function({
  search,
  limit,
  orderBy,
  fields
}) {
  this.unblock();
  // Meteor._sleepForMs 2000
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin", "staff"])) {
    const options = {
      sort: {},
      limit: Math.min(limit, 1000),
      fields
    };
    options["sort"][orderBy.field] = orderBy.ordering;
    return UsersEvents.find(search, options);
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("admin.usersEvents.counter", function({ search }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin", "staff"])) {
    Counts.publish(this, "admin.usersEvents.counter", UsersEvents.find(search));
    return;
  } else {
    this.stop();
    return;
  }
});
