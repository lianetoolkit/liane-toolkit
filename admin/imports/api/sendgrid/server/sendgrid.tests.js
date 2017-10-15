/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require("/imports/startup/server/globals.js");
require("/imports/startup/server/logger.js");

// require "/lib/utils.coffee"

const { Meteor } = require("meteor/meteor");

const { expect, assert, chai } = require("meteor/practicalmeteor:chai");

const { resetDatabase } = require("meteor/xolvio:cleaner");

const { Sendgrid } = require("./sendgrid.coffee");
const { Emails } = require("/imports/api/emails/emails.coffee");

require("/imports/api/users/server/users.fake.coffee");
const faker = require("faker");

describe("sendgrid-helpers", function() {
  this.timeout(5000);
  return it("It handles send an email", function() {
    resetDatabase();
    const user = Factory.create("user");
    const userId = user._id;

    const url = faker.internet.url();
    const emailType = "verifyEmail";
    const jobData = { emailParams: { to: "xxx@xxx.com", subject: Emails.subjects[emailType], userId: user._id }, emailType, dataContext: { ":url": url.replace("#/", "") }, extraParams: { userId: user._id } };

    const response = Sendgrid.send({
      emailParams: jobData.emailParams,
      emailType: jobData.emailType,
      dataContext: jobData.dataContext,
      extraParams: jobData.extraParams
    });
    return expect(response.result.statusCode).to.be.equal(202);
  });
});
