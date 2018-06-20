import { Entries } from "../entries.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { People } from "/imports/api/facebook/people/people.js";

Meteor.publishComposite("entries.campaignActivity", function({
  campaignId,
  facebookId,
  queryParams
}) {
  this.unblock();
  const userId = this.userId;
  const campaign = Campaigns.findOne(campaignId);
  if (userId) {
    if (_.findWhere(campaign.users, { userId })) {
      let facebookIds = campaign.accounts.map(acc => acc.facebookId);
      if (facebookId) {
        if (_.findWhere(campaign.accounts, { facebookId })) {
          facebookIds = [facebookId];
        } else {
          this.stop();
          return;
        }
      }
      let query = { resolved: { $ne: true } };
      if (queryParams.resolved == "true") {
        query.resolved = true;
      }
      return {
        find() {
          return FacebookAccounts.find({ facebookId: { $in: facebookIds } });
        },
        children: [
          {
            find(account) {
              return Likes.find(
                {
                  ...query,
                  facebookAccountId: account.facebookId,
                  created_time: { $exists: true }
                },
                {
                  sort: { created_time: -1 },
                  limit: 10
                }
              );
            },
            children: [
              {
                find: function(like) {
                  return Entries.find({ _id: like.entryId });
                }
              },
              {
                find: function(like) {
                  return People.find({ facebookId: like.personId, campaignId });
                }
              }
            ]
          },
          {
            find(account) {
              return Comments.find(
                {
                  ...query,
                  facebookAccountId: account.facebookId,
                  created_time: { $exists: true }
                },
                {
                  sort: { created_time: -1 },
                  limit: 10
                }
              );
            },
            children: [
              {
                find: function(comment) {
                  return Entries.find({ _id: comment.entryId });
                }
              },
              {
                find: function(comment) {
                  return People.find({
                    facebookId: comment.personId,
                    campaignId
                  });
                }
              }
            ]
          }
        ]
      };
    }
  }
  this.stop();
  return;
});

// Meteor.publish("entries.byAccount", function({
//   search,
//   limit,
//   orderBy,
//   fields
// }) {
//   this.unblock();
//   // Meteor._sleepForMs 2000
//   const currentUser = this.userId;
//   if (currentUser && search.facebookAccountId) {
//     const options = {
//       sort: {},
//       limit: Math.min(limit, 1000),
//       fields
//     };
//     options["sort"][orderBy.field] = orderBy.ordering;
//     return Entries.find(search, options);
//   } else {
//     this.stop();
//     return;
//   }
// });
//
// Meteor.publish("entries.byAccount.counter", function({ search }) {
//   this.unblock();
//   const currentUser = this.userId;
//   if (currentUser) {
//     Counts.publish(this, "entries.byAccount.counter", Entries.find(search));
//     return;
//   } else {
//     this.stop();
//     return;
//   }
// });
