import { Entries } from "../entries.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { People } from "/imports/api/facebook/people/people.js";

Meteor.publishComposite("entries.campaignActivity", function ({
  campaignId,
  facebookId,
  queryParams,
  limit,
}) {
  this.unblock();
  const userId = this.userId;
  if (
    !Meteor.call("campaigns.userCan", {
      campaignId,
      userId,
      feature: "comments",
      permission: "view",
    })
  ) {
    return this.ready();
  } else if (
    facebookId &&
    !Meteor.call("campaigns.hasAccount", { campaignId, facebookId })
  ) {
    return this.ready();
  } else {
    let facebookIds;
    if (facebookId) {
      facebookIds = [facebookId];
    } else {
      const campaign = Campaigns.findOne(campaignId);
      facebookIds = campaign.accounts.map((acc) => acc.facebookId);
    }
    let query = { resolved: { $ne: true } };
    if (queryParams.resolved == "true") {
      query.resolved = true;
    }
    if (queryParams.type == "comment") {
      if (queryParams.message_tags) {
        query.message_tags = { $exists: true };
      }
      if (queryParams.categories) {
        query.categories = { $in: [queryParams.categories] };
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
                ...query,
                facebookAccountId: account.facebookId,
                created_time: { $exists: true },
              },
              {
                sort: { created_time: -1 },
                limit: Math.min(limit || 10, 1000),
              }
            );
          },
          children: [
            {
              find: function (like) {
                return Entries.find({ _id: like.entryId });
              },
            },
            {
              find: function (like) {
                return People.find({ facebookId: like.personId, campaignId });
              },
            },
          ],
        },
        {
          find(account) {
            return Comments.find(
              {
                ...query,
                facebookAccountId: account.facebookId,
                created_time: { $exists: true },
              },
              {
                sort: { created_time: -1 },
                limit: Math.min(limit || 10, 1000),
              }
            );
          },
          children: [
            {
              find: function (comment) {
                return Entries.find({ _id: comment.entryId });
              },
            },
            {
              find: function (comment) {
                return People.find({
                  facebookId: comment.personId,
                  campaignId,
                });
              },
            },
          ],
        },
      ],
    };
  }
});
