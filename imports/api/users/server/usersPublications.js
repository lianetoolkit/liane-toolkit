/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Meteor.publish("users.data", function() {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser) {
    return Meteor.users.find(currentUser, {
      fields: {
        "services.facebook": 1,
        createdAt: 1
      }
    });
  } else {
    return this.ready();
  }
});

Meteor.publish("admin.users", function({ search, limit, orderBy, fields }) {
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
    return Meteor.users.find(search, options);
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("admin.users.counter", function({ search }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin", "staff"])) {
    Counts.publish(this, "admin.users.counter", Meteor.users.find(search));
    return;
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("admin.usersDetail", function({ userId }) {
  check(userId, String);
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin", "staff"])) {
    return Meteor.users.find(userId);
  } else {
    this.stop();
    return;
  }
});
