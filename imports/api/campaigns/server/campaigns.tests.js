import { Meteor } from "meteor/meteor";

import { resetDatabase } from "meteor/xolvio:cleaner";

import { expect, assert, chai } from "meteor/practicalmeteor:chai";

require("/imports/api/campaigns/server/campaigns.fake.js");

describe("campagins", function() {
  this.timeout(10000);
  return it("It creates a campaign", function() {
    resetDatabase();
    const campaign = Factory.create("campaign");
    assert.typeOf(campaign.name, "String");
    assert.typeOf(campaign.description, "String");
    return;
  });
});
