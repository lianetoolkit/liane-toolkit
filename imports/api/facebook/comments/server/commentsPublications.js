import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { People } from "/imports/api/facebook/people/people.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

Meteor.publishComposite("comments.byPerson", function({ personId }) {
  const userId = this.userId;
  const person = People.findOne(personId);
  if (person && person.facebookId) {
    const campaign = Campaigns.findOne(person.campaignId);
    const allowed = _.findWhere(campaign.users, { userId });
    if (allowed) {
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
