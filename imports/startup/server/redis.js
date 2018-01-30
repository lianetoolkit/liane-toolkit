import redis from "redis";

const config = Meteor.settings.redis;
const client = redis.createClient(config);

client.setSync = Meteor.wrapAsync(client.set).bind(client);
client.getSync = Meteor.wrapAsync(client.get).bind(client);

client.on("error", error => {
  throw new Meteor.Error("redis-error", "Could not connect to redis server.")
});

client.on("connect", () => {
  logger.info("Connected to Redis Server");
});

export default client;
