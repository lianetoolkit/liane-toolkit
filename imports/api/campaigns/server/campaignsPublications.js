import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { AccountLists } from "/imports/api/facebook/accountLists/accountLists.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { Jobs } from "/imports/api/jobs/jobs.js";

import _ from "underscore";

Meteor.publishComposite("campaigns.all", function() {
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return {
      find: function() {
        return Campaigns.find(
          {},
          {
            sort: { createdAt: -1 }
          }
        );
      },
      children: [
        {
          find: function(campaign) {
            return Jobs.find({
              "data.campaignId": campaign._id,
              type: {
                $in: [
                  "audiences.updateAccountAudience",
                  "entries.updateAccountEntries"
                ]
              }
            });
          }
        },
        {
          find: function(campaign) {
            return Meteor.users.find(
              {
                _id: { $in: _.pluck(campaign.users, "userId") }
              },
              {
                fields: {
                  name: 1,
                  "emails.address": 1
                }
              }
            );
          }
        },
        {
          find: function(campaign) {
            return FacebookAccounts.find({
              facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
            });
          }
        }
      ]
    };
  } else {
    return this.ready();
  }
});

Meteor.publish("campaigns.byUser", function() {
  const currentUser = this.userId;
  if (currentUser) {
    return Campaigns.find({
      users: { $elemMatch: { userId: currentUser } }
    });
  } else {
    return this.ready();
  }
});

Meteor.publishComposite("campaigns.publicDetail", function({ campaignId }) {
  logger.debug("campaigns.publicDetail pub", { campaignId });
  return {
    find: function() {
      return Campaigns.find(
        {
          _id: campaignId
        },
        {
          fields: {
            name: 1,
            contextId: 1,
            "forms.crm": 1
          }
        }
      );
    },
    children: [
      {
        find: function(campaign) {
          return Contexts.find(
            {
              _id: campaign.contextId
            },
            {
              fields: {
                country: 1
              }
            }
          );
        }
      }
    ]
  };
});

Meteor.publishComposite("campaigns.detail", function({ campaignId }) {
  const currentUser = this.userId;
  logger.debug("campaigns.detail pub", { campaignId });
  if (currentUser) {
    return {
      find: function() {
        return Campaigns.find(
          {
            _id: campaignId,
            users: { $elemMatch: { userId: currentUser } }
          },
          {
            fields: {
              users: 1,
              accounts: 1,
              name: 1,
              description: 1,
              contextId: 1,
              status: 1,
              forms: 1
            }
          }
        );
      },
      children: [
        {
          find: function(campaign) {
            return FacebookAccounts.find({
              facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
            });
          }
        },
        {
          find: function(campaign) {
            return AccountLists.find({
              campaignId: campaign._id
            });
          }
        },
        {
          find: function(campaign) {
            return Meteor.users.find(
              {
                _id: { $in: _.pluck(campaign.users, "userId") }
              },
              {
                fields: {
                  name: 1,
                  "emails.address": 1
                }
              }
            );
          }
        },
        {
          find: function(campaign) {
            return Contexts.find({
              _id: campaign.contextId
            });
          },
          children: [
            {
              find: function(context) {
                return Geolocations.find(
                  {
                    _id: { $in: context.geolocations }
                  },
                  {
                    fields: {
                      name: 1
                    }
                  }
                );
              }
            }
          ]
        }
      ]
    };
  } else {
    return this.ready();
  }
});

// Meteor.publishComposite("campaigns.jobsCount", function() {
//   const currentUser = this.userId;
//   logger.debug("campaigns.jobsCount pub");
//   if (Roles.userIsInRole(currentUser, ["admin"])) {
//     return {
//       find: function() {
//         return Campaigns.find(null, { fields: { name: 1 } });
//       },
//       children: [
//         {
//           find: function(campaign) {
//             return Counts.publish(
//               this,
//               "jobCountFor",
//               FacebookAudiences.find(search)
//             );
//           }
//         }
//       ]
//     };
//   } else {
//     this.ready();
//   }
// });
