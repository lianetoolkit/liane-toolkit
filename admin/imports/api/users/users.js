const { SimpleSchema } = require("meteor/aldeed:simple-schema");
const { Schemas } = require("/imports/utils/schemas.coffee");

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

Meteor.users.roles = Users.roles;

Meteor.users.freeServiceRoles = Users.freeServiceRoles;
// Meteor.users = {}

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
  profile: {
    type: Schemas.profile,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  createdAt: {
    type: Date
  },
  customerId: {
    type: String,
    optional: true
  },
  roles: {
    type: [String],
    optional: true,
    allowedValues: Meteor.users.roles
  },
  billingAddress: {
    type: Schemas.billingAddress,
    optional: true
  },
  paymentMethods: {
    type: [Schemas.paymentMethod],
    optional: true
  },
  countryCode: {
    type: String,
    optional: true
  },
  accountsNumber: {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  woopra: {
    type: Object,
    optional: true
  },
  "woopra.id": {
    type: String,
    optional: true
  }
});

Meteor.users.helpers({
  getThumb() {
    return this.profile.thumb || "/images/avatar4.png";
  },

  getEmail() {
    return this.emails[0].address;
  },

  getEmailVerification() {
    return this.emails[0].verified;
  },

  getPaymentMethod({ token }) {
    check(token, String);

    const { paymentMethods } = this;
    const paymentMethod = _.find(
      paymentMethods,
      method => method.token === token
    );
    if (paymentMethod) {
      return paymentMethod;
    }
    return {};
  },

  getDefaultPaymentMethod() {
    const { paymentMethods } = this;
    const paymentMethod = _.find(
      paymentMethods,
      method => method.default === true
    );
    return paymentMethod;
  }
});

Meteor.users.attachSchema(Meteor.users.schema);
