import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { People } from "/imports/api/facebook/people/people.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

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
            find: function(like) {
              return Entries.find({ _id: like.entryId });
            }
          }
        ]
      };
    }
  }
  return this.ready();
});
