import Redis from "ioredis";

const config = Meteor.settings.redis;
const client = new Redis(config);

client.setSync = Meteor.wrapAsync(client.set).bind(client);
client.getSync = Meteor.wrapAsync(client.get).bind(client);

client.on("error", error => {
  throw new Meteor.Error("redis-error", "Could not connect to redis server.");
});

client.on("connect", () => {
  logger.info("Connected to Redis Server");

  deleteByPattern(
    "audiences::result::be8d7a1e356f69923c79c18220c184e1f96115e7::*"
  );
});

export default client;

export const deleteByPattern = key => {
  const stream = client.scanStream({
    // only returns keys following the pattern of "key"
    match: key,
    // returns approximately 100 elements per call
    count: 100
  });
  let keys = [];
  stream.on("data", function(resultKeys) {
    // `resultKeys` is an array of strings representing key names
    for (let i = 0; i < resultKeys.length; i++) {
      keys.push(resultKeys[i]);
    }
  });
  stream.on("end", function() {
    if (keys.length) {
      console.log("UNLINK REDIS", { key });
      client.unlink(keys);
    }
  });
};
