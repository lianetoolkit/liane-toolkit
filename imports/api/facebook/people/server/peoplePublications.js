import { People, PeopleLists, PeopleTags, PeopleExports } from "../people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { get } from "lodash";
import _ from "underscore";
const { Jobs } = require("/imports/api/jobs/jobs.js");

Meteor.publish("people.map", function ({ campaignId }) {
  this.unblock();
  check(campaignId, String);
  const userId = this.userId;
  const campaign = Campaigns.findOne(campaignId);
  const allowed = Meteor.call("campaigns.userCan", {
    campaignId,
    userId,
    feature: "map",
    permission: "view",
  });
  if (allowed) {
    return People.find({
      campaignId,
      "location.coordinates": { $exists: true },
    });
  }
  return this.ready();
});

Meteor.publishComposite("people.unresolved", function ({ campaignId }) {
  logger.debug("people.unresolved called", { campaignId });
  check(campaignId, String);
  const userId = this.userId;
  if (userId && campaignId) {
    // Permission check
    const allowed = Meteor.call("campaigns.userCan", {
      campaignId,
      userId,
      feature: "people",
      permission: "edit",
    });
    if (allowed) {
      return {
        find: function () {
          return People.find({
            campaignId,
            unresolved: true,
            // related: { $exists: true },
          });
        },
        children(person) {
          let children = [];
          // if (person.related && person.related.length) {
          //   children.push(People.find({ _id: { $in: person.related } }));
          // }
          return children;
        },
      };
    }
  }
  return this.ready();
});

Meteor.publish("people.search", function ({ search, options }) {
  logger.debug("people.search called", {
    search,
    options,
  });
  check(search, Object);
  check(options, Object);
  const userId = this.userId;
  if (userId) {
    if (options.props.campaignId) {
      const campaign = Campaigns.findOne(options.props.campaignId);
      const allowed = Meteor.call("campaigns.userCan", {
        campaignId: options.props.campaignId,
        userId,
        feature: "people",
        permission: "view",
      });
      if (allowed) {
        let query = {
          campaignId: options.props.campaignId,
        };
        if (search.q) {
          let regex = new RegExp(search.q, "i");
          query.$or = [
            { name: regex },
            { "campaignMeta.contact.email": regex },
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

Meteor.publish("people.exports", function ({ campaignId }) {
  this.unblock();
  logger.debug("people.exportJobs called", { campaignId });
  const userId = this.userId;
  if (
    Meteor.call("campaigns.userCan", {
      campaignId,
      userId,
      feature: "people",
      permission: "view",
    })
  ) {
    return PeopleExports.find(
      { campaignId },
      {
        fields: {
          campaignId: 1,
          count: 1,
          url: 1,
          expired: 1,
          expiresAt: 1,
          createdAt: 1,
        },
      }
    );
  }
  return this.ready();
});

Meteor.publish("people.exportJobCount", function ({ campaignId }) {
  this.unblock();
  logger.debug("people.exportJobCount called", { campaignId });
  const userId = this.userId;
  if (
    Meteor.call("campaigns.isUserTeam", {
      campaignId,
      userId,
    })
  ) {
    Counts.publish(
      this,
      "people.exportJobCount",
      Jobs.find({
        type: "people.export",
        "data.campaignId": campaignId,
        status: { $ne: "failed" },
      })
    );
    return;
  }
  return this.ready();
});

Meteor.publish("people.importJobCount", function ({ campaignId }) {
  this.unblock();
  logger.debug("people.importJobCount called", { campaignId });
  const userId = this.userId;
  if (
    Meteor.call("campaigns.isUserTeam", {
      campaignId,
      userId,
    })
  ) {
    Counts.publish(
      this,
      "people.importJobCount",
      Jobs.find({
        type: "people.importPerson",
        "data.campaignId": campaignId,
        status: { $ne: "failed" },
      })
    );
    return;
  }
  return this.ready();
});

Meteor.publish("people.unresolved.count", function ({ campaignId }) {
  this.unblock();
  logger.debug("people.unresolved.count called", { campaignId });
  const userId = this.userId;
  if (
    Meteor.call("campaigns.userCan", {
      campaignId,
      userId,
      feature: "people",
      permission: "view",
    })
  ) {
    Counts.publish(
      this,
      "people.unresolved.count",
      People.find({
        campaignId,
        unresolved: true,
      })
    );
    return;
  }
  return this.ready();
});

Meteor.publishComposite("people.detail", function ({ personId }) {
  logger.debug("people.detail called", { personId });

  const userId = this.userId;
  if (userId) {
    const person = People.findOne(personId);
    if (person) {
      const campaign = Campaigns.findOne(person.campaignId);
      const facebookId = campaign.facebookAccount.facebookId;
      const allowed = Meteor.call("campaigns.userCan", {
        campaignId: person.campaignId,
        userId,
        feature: "people",
        permission: "view",
      });
      if (allowed) {
        return {
          find: function () {
            return People.find({ _id: personId });
          },
          children(person) {
            let children = [];
            if (
              Meteor.call("campaigns.userCan", {
                campaignId: person.campaignId,
                userId,
                feature: "comments",
                permission: "view",
              })
            ) {
              children.push({
                find(person) {
                  if (person.facebookId) {
                    let selector = { personId: person.facebookId };
                    if (get(person, "campaignMeta.social_networks.instagram")) {
                      selector = {
                        $or: [
                          selector,
                          {
                            personId: person.campaignMeta.social_networks.instagram.replace(
                              "@",
                              ""
                            ),
                          },
                        ],
                      };
                    }
                    return Comments.find(
                      { ...selector, facebookAccountId: facebookId },
                      {
                        sort: { created_time: -1 },
                      }
                    );
                  }
                },
                children(parentComment) {
                  let children = [
                    {
                      find: function (comment) {
                        return Entries.find({ _id: comment.entryId });
                      },
                    },
                    {
                      find: function (comment) {
                        return Comments.find(
                          {
                            personId: facebookId,
                            parentId: comment._id,
                          },
                          {
                            sort: { created_time: -1 },
                          }
                        );
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
              });
            }
            return children;
          },
        };
      }
    }
  }
  return this.ready();
});

Meteor.publish("people.tags", function ({ campaignId }) {
  logger.debug("people.tags called", { campaignId });
  const userId = this.userId;
  if (userId) {
    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      return this.ready();
    }
    const allowed = Meteor.call("campaigns.userCan", {
      campaignId,
      userId,
      feature: "people",
      permission: "view",
    });
    if (allowed) {
      return PeopleTags.find({ campaignId });
    }
  }
  return this.ready();
});

Meteor.publishComposite("people.form.detail", function ({ formId, psid }) {
  logger.debug("people.form.detail called", { formId, psid });
  let selector = {};
  if (formId) selector = { formId };
  if (psid) selector = { facebookId: psid };
  const person = People.findOne(selector);
  if (!person) {
    return this.ready();
  }
  const campaign = Campaigns.findOne({ _id: person.campaignId });
  return {
    find: function () {
      return People.find(selector, {
        fields: {
          name: 1,
          facebookId: 1,
        },
      });
    },
    children: [
      {
        find() {
          return Campaigns.find(
            { _id: person.campaignId },
            {
              fields: {
                name: 1,
                country: 1,
                "forms.crm": 1,
                "forms.skills": 1,
              },
            }
          );
        },
      },
    ],
  };
});

Meteor.publish("peopleLists.byCampaign", function ({ campaignId }) {
  this.unblock();
  const userId = this.userId;
  const campaign = Campaigns.findOne(campaignId);
  const allowed = Meteor.call("campaigns.userCan", {
    campaignId,
    userId,
    feature: "people",
    permission: "view",
  });
  if (campaign && allowed) {
    return PeopleLists.find({ campaignId });
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
