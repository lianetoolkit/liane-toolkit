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
        name: 1,
        type: 1,
        emails: 1,
        "services.facebook": 1,
        createdAt: 1
      }
    });
  } else {
    return this.ready();
  }
});

Meteor.publish("users.all", function() {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return Meteor.users.find(
      {},
      {
        fields: {
          name: 1,
          type: 1,
          roles: 1,
          emails: 1,
          createdAt: 1
        }
      }
    );
  } else {
    return this.ready();
  }
});

Meteor.publish("users.detail", function({ userId }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return Meteor.users.find(
      {
        _id: userId
      },
      {
        fields: {
          name: 1,
          type: 1,
          roles: 1,
          emails: 1,
          createdAt: 1
        }
      }
    );
  } else {
    return this.ready();
  }
});
