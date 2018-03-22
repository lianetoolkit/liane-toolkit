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
  }
});

Meteor.users.schema = new SimpleSchema({
  name: {
    type: String,
    optional: true
  },
  emails: {
    type: Array,
    optional: true
  },
  "emails.$": {
    type: Object
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  createdAt: {
    type: Date
  },
  roles: {
    type: Array,
    optional: true
  },
  "roles.$": {
    type: String,
    allowedValues: ["admin", "staff"]
  }
});

Meteor.users.helpers({
  getEmail() {
    return this.emails[0].address;
  },
  getAccessToken() {
    return this.services.facebook.accessToken;
  }
});

Meteor.users.attachSchema(Meteor.users.schema);

exports.Meteor.users = Meteor.users;
