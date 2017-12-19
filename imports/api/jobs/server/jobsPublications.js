const { Jobs } = require("/imports/api/jobs/jobs.js");

Meteor.publish("admin.jobs.counter", function({ search }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    Counts.publish(this, "admin.jobs.counter", Jobs.find(search));
    return;
  }
});

Meteor.publish("admin.jobs", function({ search, limit, orderBy, fields }) {
  this.unblock();
  search = search || {};
  limit = limit || 10;
  const currentUser = this.userId;
  if (Roles.userIsInRole(currentUser, ["admin"])) {
    const options = {
      sort: {},
      limit: Math.min(limit, 1000)
    };
    if(fields) {
      options.fields = fields;
    }
    if (orderBy) options["sort"][orderBy.field] = orderBy.ordering;
    return Jobs.find(search, options);
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("admin.jobs.supervisor", function({ userId }) {
  check(userId, String);
  this.unblock();
  const currentUser = this.userId;
  if (Roles.userIsInRole(currentUser, ["admin"])) {
    const findOptions = {
      "data.userId": userId,
      type: "users.supervisor"
    };
    return Jobs.find(findOptions);
  } else {
    this.stop();
    return;
  }
});
