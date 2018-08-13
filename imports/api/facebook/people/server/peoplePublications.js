import { People, PeopleTags } from "../people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
const { Jobs } = require("/imports/api/jobs/jobs.js");
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

Meteor.publish("people.importJobCount", function({ campaignId }) {
  this.unblock();
  logger.debug("people.importJobs called", { campaignId });
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    Counts.publish(
      this,
      "people.importJobCount",
      Jobs.find({
        type: "people.importPerson",
        "data.campaignId": campaignId,
        status: { $ne: "failed" }
      })
    );
    return;
  }

  const userId = this.userId;
  if (userId) {
    const campaign = Campaigns.findOne(campaignId);
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

Meteor.publish("people.tags", function({ campaignId }) {
  logger.debug("people.tags called", { campaignId });
  const userId = this.userId;
  if (userId) {
    const campaign = Campaigns.findOne(campaignId);
    const allowed = _.findWhere(campaign.users, { userId });
    if (allowed) {
      return PeopleTags.find({ campaignId });
    }
  }
});

Meteor.publishComposite("people.form.detail", function({ formId }) {
  logger.debug("people.form.detail called", { formId });
  const person = People.findOne({ formId });
  const campaign = Campaigns.findOne({ _id: person.campaignId });
  return {
    find: function() {
      return People.find(
        { formId },
        {
          fields: {
            name: 1,
            facebookId: 1,
            "campaignMeta.contact": 1,
            "campaignMeta.basic_info": 1
          }
        }
      );
    },
    children: [
      {
        find() {
          return Campaigns.find(
            { _id: person.campaignId },
            {
              fields: {
                name: 1,
                "forms.crm": 1
              }
            }
          );
        }
      },
      {
        find() {
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
