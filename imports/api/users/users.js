import SimpleSchema from "simpl-schema";

Meteor.users.allow({
  insert(userId, doc) {
    return false;
  },
  update(userId, doc) {
    return userId && userId === doc.userId;
  },
  remove(userId, doc) {
    return false;
  }
});

Meteor.users.schema = new SimpleSchema({
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
    type: [String],
    optional: true,
    allowedValues: ["admin", "staff"]
  }
});

Meteor.users.helpers({
  getEmail() {
    return this.emails[0].address;
  },
  isFbLogged() {
    return !!this.services.facebook;
  }
});

Meteor.users.attachSchema(Meteor.users.schema);

exports.Meteor.users = Meteor.users;
