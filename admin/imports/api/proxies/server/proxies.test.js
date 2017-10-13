/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { Proxies } from "../proxies.coffee";
import { ProxiesPackages } from "../proxiesPackages.coffee";

import "/imports/startup/server/globals.coffee";
import "/imports/startup/both/globals.coffee";

import { Meteor } from "meteor/meteor";

import { expect, assert, chai } from "meteor/practicalmeteor:chai";

import { resetDatabase } from "meteor/xolvio:cleaner";

import { ProxiesHelpers } from "./proxiesHelpers.coffee";
import { ProxyStatsHelpers } from "./proxyStatsHelpers.coffee";
import { ServiceAccounts } from "/imports/api/serviceAccounts/serviceAccounts.coffee";
import { Redis } from "/imports/api/redis/server/redis.coffee";

import "./proxies.fake.coffee";
import "/imports/api/serviceAccounts/server/serviceAccounts.fake.coffee";
import "/imports/api/users/server/users.fake.coffee";

describe("proxies-add", function() {
  this.timeout(45000);
  it("It creates a myprivateproxy package", function() {
    resetDatabase();
    const provider = "myprivateproxy";
    const packageId = Meteor.settings.proxies[provider].devPackageId;

    const docId = ProxiesHelpers.createPackage({ packageId, provider });
    return assert.typeOf(docId, "String");
  });

  return it("It updates a myprivateproxy package", function() {
    const provider = "myprivateproxy";
    const proxiesPackage = ProxiesPackages.findOne();

    const { added, removed } = ProxiesHelpers.updatePackage({
      packageId: proxiesPackage.packageId,
      provider
    });

    const proxiesCount = Proxies.find({ provider }).count();
    return expect(proxiesCount).to.be.equal(5);
  });
});

describe("proxies-handle", function() {
  it("It get a proxy for a service", function() {
    resetDatabase();
    let proxy = Factory.create("proxy");
    const service = "instagram";
    proxy = ProxiesHelpers.getBestProxyForService({ service });
    assert.typeOf(proxy, "Object");

    return expect(proxy.active).to.be.true;
  });

  it("It assign account to proxy", function() {
    const service = "instagram";

    const user = Factory.create("user", { role: ["free-trial"] });
    let serviceAccount = Factory.create("serviceAccount", { userId: user._id });
    serviceAccount = ServiceAccounts.findOne(serviceAccount._id);

    const { proxyId } = serviceAccount;
    ProxiesHelpers.assignAccountToProxy({
      proxyId,
      service,
      serviceAccountId: serviceAccount._id
    });

    const proxy = Proxies.findOne(proxyId);
    expect(proxy.services[service].accountsCount).to.be.equal(1);
    return expect(proxy.services[service].accounts).to.include(serviceAccount._id);
  });

  it("It realease an account from a proxy", function() {
    const service = "instagram";
    const user = Meteor.users.findOne();
    const serviceAccount = ServiceAccounts.findOne();
    const { proxyId } = serviceAccount;

    let proxy = ProxiesHelpers.releaseAccountFromProxy({
      proxyId,
      service,
      serviceAccountId: serviceAccount._id
    });

    proxy = Proxies.findOne(proxyId);
    expect(proxy.services[service].accountsCount).to.be.equal(0);
    return expect(proxy.services[service].accounts).to.not.include(serviceAccount._id);
  });

  return it("It updates proxy stats", function() {
    resetDatabase();
    let proxy = Factory.create("proxy");
    const proxyId = proxy._id;
    ProxyStatsHelpers.handleErrorCode({
      proxyId,
      errorCode: "ETIMEDOUT",
      service: "instagram"
    });
    ProxyStatsHelpers.handleErrorCode({ proxyId, service: "instagram" });

    ProxiesHelpers.updateStats({ proxyId });
    proxy = Proxies.findOne(proxyId);

    expect(proxy.stats.total).to.be.equal(2);
    expect(proxy.stats.success).to.be.equal(1);
    return expect(proxy.stats.successRatio).to.be.equal(50);
  });
});
