/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import moment from "moment";
import { ProxyStats } from "../proxyStats.js";
import { Redis } from "/imports/api/redis/server/redis.js";

var ProxyStatsHelpers = {
  add({ proxyId, success, service, errorType }) {
    check(proxyId, String);
    check(success, Boolean);
    check(service, String);
    check(errorType, Match.Maybe(String));

    try {
      Redis.addProxyStat({ proxyId, success });
    } catch (error) {
      logger.warn("ProxyStats.add: error", { error });
    }
  },

  handleErrorCode({ proxyId, errorCode, service }) {
    check(proxyId, String);
    check(errorCode, Match.Maybe(String));
    check(service, String);

    if (["ETIMEDOUT", "ECONNRESET", "ESOCKETTIMEDOUT"].includes(errorCode)) {
      return ProxyStatsHelpers.add({
        proxyId,
        service,
        success: false,
        errorType: errorCode
      });
    } else {
      return ProxyStatsHelpers.add({
        proxyId,
        service,
        success: true
      });
    }
  },

  getDataForChart({ hours, timeOffset, proxyId }) {
    logger.debug("ProxyStats.getDataForChart", { hours }, { timeOffset });
    check(hours, Match.Maybe(Number));
    check(timeOffset, Match.Maybe(Number));
    check(proxyId, Match.Maybe(String));

    const values = [];
    const labels = [];

    hours = hours || 48;
    const key = "proxy:ok";
    const field = proxyId || "total";
    const relatedKey = "proxy:bad";

    const date = moment().utc();

    for (let hour of Array.from(_.range(hours, -1, -1))) {
      let tempDate = moment(date).subtract(hour, "hours");

      const tempKey = `${key}:${tempDate.year()}:${tempDate.dayOfYear()}:${tempDate.hour()}`;
      const tempRelatedKey = `${relatedKey}:${tempDate.year()}:${tempDate.dayOfYear()}:${tempDate.hour()}`;
      let value = parseInt(Redis.hget(tempKey, field)) || 0;
      const relatedValue = parseInt(Redis.hget(tempRelatedKey, field)) || 0;

      value = parseInt(value / (value + relatedValue) * 100);

      values.push(value || 0);
      if (timeOffset) {
        tempDate = tempDate.utcOffset(timeOffset);
      }
      labels.push(tempDate.format("DD-MM:HH[h]"));
    }

    return { labels, values };
  }
};

exports.ProxyStatsHelpers = ProxyStatsHelpers;
