import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { People } from "/imports/api/facebook/people/people.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

Meteor.publishComposite("comments.byAccount", function({
  campaignId,
  facebookId,
  query,
  options
}) {
  this.unblock();
  const userId = this.userId;
  if (Meteor.call("campaigns.canManage", { campaignId, userId })) {
    const campaign = Campaigns.findOne(campaignId);
    if (!campaign.facebookAccount) return this.ready();
    facebookId = facebookId || campaign.facebookAccount.facebookId;
    if (campaign.facebookAccount.facebookId == facebookId) {
      options = {
        ...options,
        sort: { created_time: -1 },
        limit: Math.min(options.limit || 10, 20)
      };
      return {
        find: function() {
          return Comments.find(
            {
              ...query,
              facebookAccountId: facebookId,
              created_time: { $exists: true }
            },
            options
          );
        },
        children(parentComment) {
          let children = [
            {
              find: function(comment) {
                return People.find({
                  facebookId: comment.personId,
                  campaignId
                });
              }
            },
            {
              find: function(comment) {
                return Entries.find({ _id: comment.entryId });
              }
            },
            {
              find: function(comment) {
                return Comments.find({
                  personId: facebookId,
                  parentId: comment._id
                });
              }
            }
          ];
          if (parentComment.parentId) {
            children.push({
              find: function(comment) {
                if (comment.parentId) {
                  return Comments.find({ _id: comment.parentId });
                }
              }
            });
          }
          return children;
        }
      };
    }
  }
  return this.ready();
});

Meteor.publishComposite("comments.byPerson", function({ personId }) {
  const userId = this.userId;
  const person = People.findOne(personId);
  const campaignId = person.campaignId;
  if (person && person.facebookId) {
    if (Meteor.call("campaigns.canManage", { campaignId, userId })) {
      const campaign = Campaigns.findOne(person.campaignId);
      return {
        find: function() {
          return Comments.find({
            personId: person.facebookId,
            facebookAccountId: { $in: campaign.accounts.map(a => a.facebookId) }
          });
        },
        children: [
          {
            find: function(comment) {
              return Entries.find({ _id: comment.entryId });
            }
          }
        ]
      };
    }
  }
  return this.ready();
});
