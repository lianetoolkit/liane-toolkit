const { Jobs } = require("/imports/api/jobs/jobs.js");

Meteor.publish("jobs.byCampaign", function ({ campaignId, type, status }) {
  this.unblock();
  const currentUser = this.userId;
  if (
    currentUser &&
    Meteor.call("campaigns.isUserTeam", {
      campaignId,
      userId: currentUser,
    })
  ) {
    let selector = { "data.campaignId": campaignId };
    if (type) {
      selector.type = type;
    }
    if (status) {
      selector.status = status;
    }
    return Jobs.find(selector, {
      fields: {
        repeated: 1,
        status: 1,
        "data.campaignId": 1,
        type: 1,
      },
    });
  } else {
    return this.ready();
  }
});

Meteor.publish("admin.jobs.counter", function ({ search }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    Counts.publish(this, "admin.jobs.counter", Jobs.find(search));
    return;
  }
});

Meteor.publish("admin.jobs", function ({ query, options }) {
  this.unblock();
  const currentUser = this.userId;
  if (Roles.userIsInRole(currentUser, ["admin"])) {
    return Jobs.find(query || {}, options || { sort: { created: -1 } });
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("admin.jobs.supervisor", function ({ userId }) {
  check(userId, String);
  this.unblock();
  const currentUser = this.userId;
  if (Roles.userIsInRole(currentUser, ["admin"])) {
    const findOptions = {
      "data.userId": userId,
      type: "users.supervisor",
    };
    return Jobs.find(findOptions);
  } else {
    this.stop();
    return;
  }
});
