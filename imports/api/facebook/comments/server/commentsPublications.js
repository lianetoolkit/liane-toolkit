import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { People } from "/imports/api/facebook/people/people.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

Meteor.publishComposite("comments.byAccount", function ({
  campaignId,
  facebookId,
  query,
  options,
}) {
  this.unblock();
  const userId = this.userId;
  if (
    Meteor.call("campaigns.userCan", {
      campaignId,
      userId,
      feature: "comments",
      permission: "view",
    })
  ) {
    const campaign = Campaigns.findOne(campaignId);
    if (!campaign.facebookAccount) return this.ready();
    facebookId = facebookId || campaign.facebookAccount.facebookId;
    if (campaign.facebookAccount.facebookId == facebookId) {
      options = {
        ...options,
        sort: { created_time: -1 },
        limit: options.limit,
      };
      return {
        find: function () {
          return Comments.find(
            {
              ...query,
              facebookAccountId: facebookId,
              created_time: { $exists: true },
            },
            options
          );
        },
        children(parentComment) {
          let children = [
            {
              find: function (comment) {
                return People.find({
                  campaignId,
                  $or: [
                    { facebookId: comment.personId },
                    {
                      "campaignMeta.social_networks.instagram": `@${comment.personId}`,
                    },
                  ],
                });
              },
            },
            {
              find: function (comment) {
                return Entries.find({ _id: comment.entryId });
              },
            },
            {
              find: function (comment) {
                return Comments.find({
                  personId: facebookId,
                  parentId: comment._id,
                });
              },
            },
          ];
          if (parentComment.parentId) {
            children.push({
              find: function (comment) {
                if (comment.parentId) {
                  return Comments.find({ _id: comment.parentId });
                }
              },
            });
          }
          return children;
        },
      };
    }
  }
  return this.ready();
});
