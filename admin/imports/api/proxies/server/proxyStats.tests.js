import moment from "moment";
import "/imports/startup/server/globals.js";

import { Meteor } from "meteor/meteor";

import { expect, assert, chai } from "meteor/practicalmeteor:chai";

import { resetDatabase } from "meteor/xolvio:cleaner";

import { ProxyStatsHelpers } from "./proxyStatsHelpers.js";
import { ServiceAccounts } from "/imports/api/serviceAccounts/serviceAccounts.js";
import { Redis } from "/imports/api/redis/server/redis.js";

import "./proxies.fake.js";

describe("proxies-stats", function() {
  it("It handle proxy error code", function() {
    resetDatabase();
    const proxy = Factory.create("proxy");
    ProxyStatsHelpers.handleErrorCode({
      proxyId: proxy._id,
      errorCode: "ETIMEDOUT",
      service: "instagram"
    });

    const { success, error } = Redis.getProxyStats({ proxyId: proxy._id });
    expect(success).to.be.equal(0);
    return expect(error).to.be.equal(1);
  });

  return it("It handle proxy success code", function() {
    resetDatabase();
    const proxy = Factory.create("proxy");
    ProxyStatsHelpers.handleErrorCode({
      proxyId: proxy._id,
      service: "instagram"
    });

    const { success, error } = Redis.getProxyStats({ proxyId: proxy._id });
    expect(success).to.be.equal(1);
    return expect(error).to.be.equal(0);
  });
});
