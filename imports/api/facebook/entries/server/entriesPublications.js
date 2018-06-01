import { Entries } from "../entries.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

Meteor.publishComposite("entries.campaignActivity", function({
  campaignId,
  facebookId
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
      return {
        find() {
          return FacebookAccounts.find({ facebookId: { $in: facebookIds } });
        },
        children: [
          {
            find(account) {
              return Likes.find(
                {
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
              }
            ]
          },
          {
            find(account) {
              return Comments.find(
                {
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
