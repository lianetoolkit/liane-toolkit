import { People } from "../people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import _ from "underscore";

Meteor.publish("people.search", function({ search, options }) {
  logger.debug("people.search called", {
    search,
    options
  });
  check(search, Object);
  check(options, Object);
  const userId = this.userId;
  if (userId) {
    if (options.props.campaignId) {
      const campaign = Campaigns.findOne(options.props.campaignId);
      const allowed = _.findWhere(campaign.users, { userId });
      if (allowed) {
        let query = {
          campaignId: options.props.campaignId
        };
        if (search.q) {
          let regex = new RegExp(search.q, "i");
          query.$or = [
            { name: regex },
            { "campaignMeta.contact.email": regex }
          ];
        }
        Mongo.Collection._publishCursor(
          People.find(query, { limit: 10 }),
          this,
          "people.search"
        );
      }
    }
  }
  return this.ready();
});

Meteor.publish("people.detail", function({ personId }) {
  logger.debug("people.detail called", { personId });

  const userId = this.userId;
  if (userId) {
    const person = People.findOne(personId);
    if (person) {
      const campaign = Campaigns.findOne(person.campaignId);
      const allowed = _.findWhere(campaign.users, { userId });
      if (allowed) {
        return People.find({ _id: personId });
      }
    }
  }
  return this.ready();
});

// Meteor.publish("people.byAccount", function({
//   search,
//   limit,
//   orderBy,
//   fields
// }) {
//   this.unblock();
//   const currentUser = this.userId;
//   if (currentUser) {
//     const options = {
//       sort: {},
//       limit: Math.min(limit, 1000),
//       fields
//     };
//     options["sort"][orderBy.field] = orderBy.ordering;
//     return People.find(search, options);
//   } else {
//     this.stop();
//     return;
//   }
// });
//
// Meteor.publish("people.byAccount.counter", function({ search }) {
//   this.unblock();
//   const currentUser = this.userId;
//   if (currentUser) {
//     Counts.publish(this, "people.byAccount.counter", People.find(search));
//     return;
//   } else {
//     this.stop();
//     return;
//   }
// });
