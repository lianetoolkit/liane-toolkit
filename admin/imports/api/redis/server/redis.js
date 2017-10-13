import redis from "redis";
import moment from "moment";
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

let client;
if (process && process.env && process.env.REDIS_URL) {
  logger.info("> REDIS: connecting...");
  client = redis.createClient(process.env.REDIS_URL); // for production
} else {
  throw new Meteor.Error("Redis.error.redisUrlNotFound");
}

client.hgetSync = Meteor.wrapAsync(client.hget);
client.hsetSync = Meteor.wrapAsync(client.hset);
client.zrangeSync = Meteor.wrapAsync(client.zrange);
client.zrevrangeSync = Meteor.wrapAsync(client.zrevrange);

client.on("error", error => logger.warn("REDIS: error", error));

client.on("connect", () => logger.info("> REDIS: connected"));

var Redis = {
  hget(key, field) {
    // logger.debug "Redis.hget: called", {key, field}
    const response = client.hgetSync(key, field);
    // logger.info "Redis.hget: called", {key, field, response}
    return response;
  },

  addProxyStat({ proxyId, success }) {
    check(proxyId, String);
    check(success, Boolean);

    if (Meteor.settings.public.deployMode === "staging") {
      return;
    }

    const date = moment().utc();
    const key = `proxy:${success
      ? "ok"
      : "bad"}:${date.year()}:${date.dayOfYear()}:${date.hour()}`;
    // logger.debug "Redis.addProxyStat", {proxyId, success, key}
    client.HINCRBY(key, proxyId, 1);
    client.HINCRBY(key, "total", 1);
  },

  getProxyStats({ proxyId }) {
    check(proxyId, String);

    if (Meteor.settings.public.deployMode === "staging") {
      return;
    }

    let date = moment().utc();
    if (date.minute() < 20 && !Meteor.isTest) {
      date = date.subtract(1, "hours");
    }
    // logger.debug "Redis.getProxyStats", {proxyId}, {hour: date.hour()}, {minute: date.minute()}
    const stats = {
      success:
        parseInt(
          Redis.hget(
            `proxy:ok:${date.year()}:${date.dayOfYear()}:${date.hour()}`,
            proxyId
          )
        ) || 0,
      error:
        parseInt(
          Redis.hget(
            `proxy:bad:${date.year()}:${date.dayOfYear()}:${date.hour()}`,
            proxyId
          )
        ) || 0
    };

    return stats;
  },

  deleteOldKeys() {
    logger.info("Redis.deleteOldKeys: called");

    if (Meteor.settings.public.deployMode === "staging") {
      return;
    }

    const todayDayOfYear = moment().dayOfYear();
    const year = moment()
      .utc()
      .year();
    return (() => {
      const result = [];
      for (var dayOfYear of Array.from(
        _.range(todayDayOfYear - 4, todayDayOfYear - 15, -1)
      )) {
        result.push(
          (() => {
            const result1 = [];
            for (let hour of Array.from(_.range(24))) {
              client.DEL(`proxy:ok:${year}:${dayOfYear}:${hour}`);
              client.DEL(`proxy:bad:${year}:${dayOfYear}:${hour}`);
              result1.push(
                client.DEL(`interactions:${year}:${dayOfYear}:${hour}`)
              );
            }
            return result1;
          })()
        );
      }
      return result;
    })();
  }
};

exports.Redis = Redis;
