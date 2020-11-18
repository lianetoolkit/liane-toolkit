import SimpleSchema from "simpl-schema";
import { Messages } from "/imports/api/messages/messages.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { CampaignsHelpers } from "/imports/api/campaigns/server/campaignsHelpers.js";
import { uniq } from "lodash";
import createEmail from "/imports/emails/server/createEmail";
import { languages } from "/locales";

const filtersSchema = new SimpleSchema({
  target: {
    type: String,
    allowedValues: ["users", "campaigns"],
    defaultValue: "users",
  },
  userId: {
    type: String,
    optional: true,
  },
  userType: {
    type: String,
    allowedValues: ["user", "campaigner"],
    optional: true,
  },
  userLanguage: {
    type: String,
    optional: true,
  },
  campaignId: {
    type: Array,
    optional: true,
  },
  "campaignId.$": {
    type: String,
  },
  campaignAdmins: {
    type: Boolean,
    defaultValue: false,
    optional: true,
  },
  campaignType: {
    type: String,
    optional: true,
  },
  campaignCountry: {
    type: String,
    optional: true,
  },
  campaignGeolocation: {
    type: String,
    optional: true,
  },
  campaignOffice: {
    type: String,
    optional: true,
  },
});

const MessagesHelpers = {
  filtersSchema,
  getUsersQuery({ filters }) {
    let query = {};
    if (filters.userId) {
      query._id = filters.userId;
    } else {
      if (filters.userType) {
        query.type = filters.userType;
      }
      if (filters.userLanguage) {
        query.userLanguage = filters.userLanguage;
      }
    }
    return query;
  },
  getCampaignsQuery({ filters }) {
    let campaignsQuery = {};
    let query = {};
    const admins = filters.campaignAdmins;
    if (filters.campaignId) {
      campaignsQuery._id = { $in: filters.campaignId };
    }
    if (filters.campaignCountry) {
      campaignsQuery.country = filters.campaignCountry;
    }
    if (filters.campaignType) {
      campaignsQuery.type = filters.campaignType;
    }
    if (filters.campaignGeolocation) {
      campaignsQuery.geolocationId = filters.campaignGeolocation;
    }
    if (filters.campaignOffice) {
      campaignsQuery.office = filters.campaignOffice;
    }

    // No admin selection and no campaign filters means everyone
    if (!admins && !Object.keys(campaignsQuery).length) return {};

    const campaigns = Campaigns.find(campaignsQuery).fetch();

    // No campaign found invalidate the request
    if (!campaigns.length) return false;

    let userIds = [];
    for (const campaign of campaigns) {
      let users;
      if (admins) {
        users = CampaignsHelpers.getAdmins({ campaignId: campaign._id });
      } else {
        users = campaign.users;
      }
      userIds = userIds.concat(users.map((user) => user.userId));
    }
    userIds = uniq(userIds);

    // No user found invalidate the request
    if (!userIds.length) return false;

    query = { _id: { $in: userIds } };
    return query;
  },
  getFilterQueryCursor({ filters }) {
    filtersSchema.validate(filters);
    let query = {};
    switch (filters.target) {
      case "users":
        query = this.getUsersQuery({ filters });
        break;
      case "campaigns":
        query = this.getCampaignsQuery({ filters });
        break;
    }

    // Invalid query
    if (!query) return false;

    return Meteor.users.find(query);
  },
  createEmail({ messageId, title, content, filters }) {
    let emails = {};
    let locales = [];
    if (filters.userLanguage) {
      locales = [filters.userLanguage];
    } else {
      locales = Object.keys(languages);
    }
    for (const locale of locales) {
      emails[locale] = createEmail(
        "message",
        locale,
        { messageId, content },
        title
      );
    }
    return emails;
  },
};

exports.MessagesHelpers = MessagesHelpers;
