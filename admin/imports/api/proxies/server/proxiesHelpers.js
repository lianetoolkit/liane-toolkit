import { HTTP } from "meteor/http";
// import { ServiceAccounts } from "/imports/api/serviceAccounts/serviceAccounts.js";

import { Proxies } from "../proxies.js";
import { ProxiesPackages } from "../proxiesPackages.js";
import { Redis } from "/imports/api/redis/server/redis.js";

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

export const ProxiesHelpers = {
  createPackage({ packageId, provider }) {
    check(packageId, String);
    check(provider, String);

    const { api_key } = Meteor.settings.proxies[provider];
    if (!api_key) {
      throw new Meteor.Error(
        "Permission Denied",
        `You need to add ${provider} api key to settings`
      );
    }

    const doc = { packageId, provider };

    if (provider === "myprivateproxy") {
      const url = `https://api.myprivateproxy.net/v1/fetchProxies/json/full/${packageId}/${api_key}`;
      const response = HTTP.get(url);
      if (response.statusCode === 200 && response.data != null) {
        doc.quantity = response.data.length;
        const docId = ProxiesPackages.insert(doc);
        return docId;
      }
    }
  },

  updatePackage({ packageId, provider }) {
    let proxies, proxyIps;
    check(packageId, String);
    check(provider, String);

    const { api_key } = Meteor.settings.proxies[provider];
    if (!api_key) {
      throw new Meteor.Error(
        "Permission Denied",
        `You need to add ${doc.provider} api key to settings`
      );
    }

    let removedProxies = 0;
    let updatedProxies = 0;

    if (provider === "myprivateproxy") {
      const url = `https://api.myprivateproxy.net/v1/fetchProxies/json/full/${packageId}/${api_key}`;
      const response = HTTP.get(url);
      if (response.statusCode === 200 && response.data != null) {
        proxies = response.data;
        proxyIps = _.pluck(proxies, "proxy_ip");

        updatedProxies = proxies.length;

        for (let proxy of Array.from(proxies)) {
          const proxyObj = {
            packageId,
            ip: proxy.proxy_ip,
            portHttp: proxy.proxy_port,
            login: proxy.username,
            password: proxy.password,
            provider,
            active: true
          };

          for (let service of Array.from(activeServices)) {
            proxyObj[`services.${service}`] = {
              accounts: [],
              accountsCount: 0
            };
          }

          Proxies.upsert({ ip: proxy.proxy_ip }, { $set: proxyObj });
        }
      }
    }

    if ((proxies != null ? proxies.length : undefined) > 0) {
      const findOptions = {
        packageId,
        active: true,
        ip: {
          $nin: proxyIps
        }
      };

      const notValidProxiesIps = _.pluck(
        Proxies.find(findOptions).fetch(),
        "ip"
      );

      const updateOptions = {
        $set: {
          active: false
        }
      };

      Proxies.update({ ip: { $in: notValidProxiesIps } }, updateOptions, {
        multi: true
      });
      removedProxies = notValidProxiesIps.length;
    }

    logger.info("ProxiesHelpers.updatePackage", {
      removedProxies,
      updatedProxies
    });

    return { removedProxies, updatedProxies };
  },

  getBestProxyForService({ service }) {
    check(service, String);

    const findOptions = {
      [`services.${service}.accountsCount`]: {
        $lte: Meteor.settings.proxies.accountsPerProxy
      },
      active: true
    };

    findOptions["stats.total"] = { $gt: 10 };
    findOptions["stats.successRatio"] = 100;

    let proxies = Proxies.find(findOptions, { limit: 100 }).fetch();

    if (
      !(typeof proxys !== "undefined" && proxys !== null
        ? proxys.length
        : undefined)
    ) {
      delete findOptions["stats.total"];
      delete findOptions["stats.successRatio"];
      proxies = Proxies.find(findOptions, { limit: 100 }).fetch();
    }

    const proxy = _.sample(proxies);

    // if !Meteor.isTest
    //   Meteor.setTimeout ->
    //     _checkServiceProxysNumber {service}
    //     return
    //   , 0

    return proxy;
  },

  assignAccountToProxy({ proxyId, service, serviceAccountId }) {
    check(proxyId, String);
    check(serviceAccountId, String);
    check(service, String);

    const proxy = Proxies.findOne(proxyId);

    if (!proxy) {
      return null;
    }

    const proxyUpdateOptions = {
      $addToSet: {
        [`services.${service}.accounts`]: serviceAccountId
      },
      $inc: {
        [`services.${service}.accountsCount`]: 1
      }
    };

    Proxies.update(proxy._id, proxyUpdateOptions);

    const accountUpdateOptions = {
      $set: {
        proxyId: proxy._id
      }
    };

    // ServiceAccounts.update(serviceAccountId, accountUpdateOptions);

    return proxy;
  },

  releaseAccountFromProxy({ proxyId, serviceAccountId, service }) {
    check(proxyId, String);
    check(serviceAccountId, String);
    check(service, String);

    logger.debug("Proxys.releaseAccountFromProxy called", {
      proxyId,
      serviceAccountId,
      service
    });

    const proxy = Proxies.findOne(proxyId);

    const proxyUpdateOptions = {
      $pull: {
        [`services.${service}.accounts`]: serviceAccountId
      },
      $inc: {
        [`services.${service}.accountsCount`]: -1
      }
    };

    if (proxy != null) {
      Proxies.update(proxyId, proxyUpdateOptions);
    }

    const accountUpdateOptions = {
      $set: {
        proxyId: null
      }
    };

    // ServiceAccounts.update(serviceAccountId, accountUpdateOptions);
  },

  getAccountProxy({ serviceAccountId, service, proxyId }) {
    let proxy;
    check(serviceAccountId, String);
    check(service, String);
    check(proxyId, Match.Maybe(String));

    if (proxyId != null) {
      proxy = Proxies.findOne(proxyId);
      if (proxy == null || !proxy.active) {
        ProxiesHelpers.releaseAccountFromProxy({
          proxyId,
          serviceAccountId,
          service
        });
        proxy = ProxiesHelpers.getAndAssignProxyForService({
          serviceAccountId,
          service
        });
      }
    } else {
      proxy = ProxiesHelpers.getAndAssignProxyForService({
        serviceAccountId,
        service
      });
    }

    const proxyUrl = proxy.url();

    return { proxy, proxyUrl };
  },

  getAndAssignProxyForService({ service, serviceAccountId }) {
    check(serviceAccountId, String);
    check(service, String);

    const proxy = ProxiesHelpers.getBestProxyForService({ service });

    if (proxy != null) {
      ProxiesHelpers.assignAccountToProxy({
        proxyId: proxy._id,
        service,
        serviceAccountId
      });
      return proxy;
    }
  },

  checkProxyStatus({ proxyId }) {
    check(proxyId, String);

    const proxy = Proxies.findOne(proxyId);
    const total = (proxy && proxy.stats && proxy.stats.total) || 0;
    const successRatio = proxy && proxy.stats && proxy.stats.successRatio;

    if (total > 10 && successRatio < 90) {
      return false;
    }

    return true;
  },

  updateStats({ proxyId }) {
    logger.debug("Proxys.updateStatus: called", { proxyId });
    check(proxyId, String);

    const proxyStats = Redis.getProxyStats({ proxyId });
    const totalCounter = proxyStats.success + proxyStats.error;

    const successCounter = proxyStats.success;

    const successRatio = parseInt(successCounter * 100 / totalCounter) || 0;

    // logger.debug "Proxys.updateStatus", {proxyId, totalCounter, successCounter, successRatio}

    Proxies.update(
      { _id: proxyId },
      {
        $set: {
          "stats.total": totalCounter,
          "stats.success": successCounter,
          "stats.successRatio": successRatio
        }
      }
    );
  },

  updateAllProxiesStats() {
    logger.info("ProxiesHelpers.updateStats: called");
    const proxies = Proxies.find().fetch();
    const proxiesIds = _.pluck(proxies, "_id");
    for (let proxyId of Array.from(proxiesIds)) {
      ProxiesHelpers.updateStats({ proxyId });
    }
  }
};
