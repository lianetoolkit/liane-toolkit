import SimpleSchema from "simpl-schema";
import { Random } from "meteor/random";
import {
  FEATURES,
  PERMISSIONS,
  FEATURE_PERMISSION_MAP,
} from "/imports/utils/campaignPermissions";
const Campaigns = new Mongo.Collection("campaigns");

let userFeaturePermissions = {};
for (feature of FEATURES) {
  userFeaturePermissions[`permissions.${feature}`] = {
    type: Number,
    defaultValue: 0,
  };
}

Campaigns.usersSchema = new SimpleSchema({
  userId: {
    type: String,
    index: 1,
    optional: true,
  },
  inviteId: {
    type: String,
    index: 1,
    optional: true,
  },
  email: {
    type: String,
    index: 1,
    optional: true,
  },
  status: {
    type: String,
    index: 1,
    allowedValues: ["pending", "suspended", "active"],
    defaultValue: "pending",
    optional: true,
  },
  role: {
    type: String,
    optional: true,
  },
  permissions: {
    type: Object,
  },
  ...userFeaturePermissions,
});

Campaigns.accountsSchema = new SimpleSchema({
  userFacebookId: {
    type: String,
  },
  facebookId: {
    type: String,
  },
  accessToken: {
    type: String,
  },
});

Campaigns.schema = new SimpleSchema({
  name: {
    type: String,
  },
  party: {
    type: String,
  },
  candidate: {
    type: String,
  },
  office: {
    type: String,
    index: true,
  },
  creatorId: {
    type: String,
  },
  users: {
    type: Array,
  },
  "users.$": {
    type: Campaigns.usersSchema,
  },
  country: {
    type: String,
    optional: true,
    index: 1,
  },
  geolocationId: {
    type: String,
    optional: true,
    index: 1,
  },
  autoReplyMessage: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  status: {
    type: String,
    optional: true,
  },
  facebookAccount: {
    type: Campaigns.accountsSchema,
  },
  forms: {
    type: Object,
    optional: true,
  },
  "forms.slug": {
    type: String,
    optional: true,
    index: 1,
  },
  "forms.crm": {
    type: Object,
    optional: true,
  },
  "forms.crm.language": {
    type: String,
    optional: true,
  },
  "forms.crm.header": {
    type: String,
    optional: true,
  },
  "forms.crm.text": {
    type: String,
    optional: true,
  },
  "forms.crm.thanks": {
    type: String,
    optional: true,
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        return this.unset();
      }
    },
  },
});

Campaigns.attachSchema(Campaigns.schema);

Meteor.startup(() => {
  if (Meteor.isServer) {
    Campaigns.rawCollection().createIndex({
      name: "text",
    });
  }
});

const Invites = new Mongo.Collection("invites");

Invites.schema = new SimpleSchema({
  key: {
    type: String,
    index: true,
    autoValue() {
      if (this.isInsert) {
        return Random.id();
      } else if (this.isUpsert) {
        return { $setOnInsert: Random.id() };
      } else {
        return this.unset();
      }
    },
  },
  name: {
    type: String,
    optional: true,
  },
  email: {
    type: String,
    optional: true,
  },
  sent: {
    type: Boolean,
    defaultValue: false,
    optional: true,
  },
  used: {
    type: Boolean,
    defaultValue: false,
  },
  usedBy: {
    type: String,
    optional: true,
    index: true,
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        return this.unset();
      }
    },
  },
});

Invites.attachSchema(Invites.schema);

exports.Campaigns = Campaigns;
exports.Invites = Invites;
