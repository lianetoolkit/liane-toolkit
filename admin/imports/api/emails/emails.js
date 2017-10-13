const Emails = new Meteor.Collection("emails");

Emails.emailTypes = ["verifyEmail", "resetPassword"];

Emails.subjects = {
  verifyEmail: "Confirm Your Email Address",
  resetPassword: "Reset your Password"
};

Emails.schema = new SimpleSchema({
  userId: {
    type: String,
    index: 1
  },
  extraFields: {
    type: Object,
    optional: true,
    blackbox: true
  },
  address: {
    type: String
  },
  emailType: {
    type: String,
    allowedValues: Emails.emailTypes
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
    }
  }
});

Emails.attachSchema(Emails.schema);

exports.Emails = Emails;
