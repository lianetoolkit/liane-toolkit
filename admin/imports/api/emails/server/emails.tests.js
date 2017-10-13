require("/imports/startup/server/globals.js");
require("/imports/startup/server/logger.js");

// require "/lib/utils.coffee"

const { Meteor } = require("meteor/meteor");

const { expect, assert, chai } = require("meteor/practicalmeteor:chai");

const { resetDatabase } = require("meteor/xolvio:cleaner");

const { EmailsHelpers } = require("./emailsHelpers.js");
const { EmailsJobs } = require("./emailsJobs.js");
const { Emails } = require("../emails.js");
const { JobsHelpers } = require("/imports/api/jobs/server/jobsHelpers.js");
const { Jobs } = require("/imports/api/jobs/jobs.js");

require("/imports/api/users/server/users.fake.js");
const faker = require("faker");

describe("emails-helpers", function() {
  this.timeout(5000);
  it("It handles create an email", function() {
    resetDatabase();
    const user = Factory.create("user");
    const userId = user._id;

    const { address } = user.emails[0];
    const random = _.random(Emails.emailTypes.length - 1);
    const emailType = Emails.emailTypes[random];

    const extraFields = { userId };

    EmailsHelpers.handleCreate({ userId, address, emailType, extraFields });

    const email = Emails.findOne({ userId });
    expect(email.address).to.be.equal(address);
    return expect(email.emailType).to.be.equal(emailType);
  });

  it("It handles send verify email", function() {
    resetDatabase();
    let user = Factory.create("user");

    const url = faker.internet.url();

    user = { _id: user._id, emails: [{ address: user.emails[0].address, verify: false }] };

    EmailsHelpers.sendVerifyEmail({ url, user });

    const jobs = Jobs.find({
      type: "emails.send",
      "data.emailType": "verifyEmail"
    }).count();
    return expect(jobs).to.be.equal(1);
  });

  return it("It handles send reset password email", function() {
    resetDatabase();
    let user = Factory.create("user");

    const url = faker.internet.url();

    user = { _id: user._id, emails: [{ address: user.emails[0].address, verify: false }] };

    EmailsHelpers.sendResetPassword({ url, user });

    const jobs = Jobs.find({
      type: "emails.send",
      "data.emailType": "resetPassword"
    }).count();
    return expect(jobs).to.be.equal(1);
  });
});
