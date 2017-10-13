require('/imports/startup/server/globals.coffee')
require('/imports/startup/server/logger.coffee')

# require "/lib/utils.coffee"

{ Meteor } = require 'meteor/meteor'

{ expect, assert, chai } = require 'meteor/practicalmeteor:chai'

{ resetDatabase } = require 'meteor/xolvio:cleaner'

{ Sendgrid } = require './sendgrid.coffee'
{ Emails } = require '/imports/api/emails/emails.coffee'

require "/imports/api/users/server/users.fake.coffee"
faker = require 'faker'

describe 'sendgrid-helpers', () ->
  @timeout(5000)
  it 'It handles send an email', () ->
    resetDatabase()
    user = Factory.create('user')
    userId = user._id

    url = faker.internet.url()
    emailType = "verifyEmail"
    jobData =
      emailParams:
        to: 'roly@elevenyellow.com'
        subject: Emails.subjects[emailType]
        userId: user._id
      emailType: emailType
      dataContext:
        ':url': url.replace( '#/', '' )
      extraParams:
        userId: user._id

    response = Sendgrid.send {emailParams:jobData.emailParams, emailType:jobData.emailType, dataContext:jobData.dataContext, extraParams:jobData.extraParams}
    expect(response.result.statusCode).to.be.equal(202)
