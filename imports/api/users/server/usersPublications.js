import { Campaigns } from "/imports/api/campaigns/campaigns";

Meteor.publish("users.data", function () {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser) {
    return Meteor.users.find(currentUser, {
      fields: {
        name: 1,
        type: 1,
        emails: 1,
        // "services.facebook": 1,
        country: 1,
        region: 1,
        phone: 1,
        campaignRole: 1,
        ref: 1,
        userLanguage: 1,
        createdAt: 1,
      },
    });
  } else {
    return this.ready();
  }
});

Meteor.publishComposite("users.all", function ({ query, options }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return {
      find: function () {
        return Meteor.users.find(
          query || {},
          options || {
            fields: {
              name: 1,
              type: 1,
              roles: 1,
              emails: 1,
              createdAt: 1,
            },
          }
        );
      },
      children: [
        {
          find: function (user) {
            return Campaigns.find(
              {
                users: { $elemMatch: { userId: user._id } },
              },
              { fields: { name: 1 } }
            );
          },
        },
      ],
    };
  } else {
    return this.ready();
  }
});

Meteor.publish("users.detail", function ({ userId }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return Meteor.users.find(
      {
        _id: userId,
      },
      {
        fields: {
          name: 1,
          type: 1,
          roles: 1,
          emails: 1,
          createdAt: 1,
        },
      }
    );
  } else {
    return this.ready();
  }
});
