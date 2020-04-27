import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { People } from "/imports/api/facebook/people/people.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";

Meteor.publishComposite("likes.byPerson", function ({ personId }) {
  const userId = this.userId;
  const person = People.findOne(personId);
  const campaignId = person.campaignId;
  if (person && person.facebookId) {
    if (
      Meteor.call("campaigns.userCan", { campaignId, userId, feature: "admin" })
    ) {
      const campaign = Campaigns.findOne(person.campaignId);
      return {
        find: function () {
          return Likes.find({
            personId: person.facebookId,
            facebookAccountId: {
              $in: campaign.accounts.map((a) => a.facebookId),
            },
          });
        },
        children: [
          {
            find: function (like) {
              return Entries.find({ _id: like.entryId });
            },
          },
        ],
      };
    }
  }
  return this.ready();
});
