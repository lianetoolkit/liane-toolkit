import SimpleSchema from "simpl-schema";

Meteor.users.allow({
  insert(userId, doc) {
    return false;
  },
  update(userId, doc) {
    return false;
  },
  remove(userId, doc) {
    return false;
  },
});

Meteor.users.schema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  country: {
    type: String,
    optional: true,
    index: true,
  },
  region: {
    type: String,
    optional: true,
    index: true,
  },
  type: {
    type: String,
    allowedValues: ["campaigner", "user"],
    optional: true,
    index: true,
  },
  emails: {
    type: Array,
    optional: true,
  },
  "emails.$": {
    type: Object,
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  "emails.$.verified": {
    type: Boolean,
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  userLanguage: {
    type: String,
    optional: true,
    index: 1,
  },
  createdAt: {
    type: Date,
  },
  roles: {
    type: Array,
    optional: true,
  },
  "roles.$": {
    type: String,
    allowedValues: ["admin", "staff", "moderator"],
  },
  phone: {
    type: String,
    optional: true,
  },
  campaignRole: {
    type: String,
    optional: true,
  },
  ref: {
    type: String,
    optional: true,
  },
});

Meteor.users.helpers({
  getEmail() {
    return this.emails[0].address;
  },
  getAccessToken() {
    return this.services.facebook.accessToken;
  },
});

Meteor.users.attachSchema(Meteor.users.schema);

// Create text index for users (search)
Meteor.startup(() => {
  if (Meteor.isServer) {
    Meteor.users.rawCollection().createIndex(
      {
        name: "text",
        "emails.address": "text",
      },
      {
        background: true,
        weights: {
          name: 5,
          "emails.address": 3,
        },
      }
    );
  }
});

exports.Users = Meteor.users;
