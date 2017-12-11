import redis from "redis";

const config = Meteor.settings.redis;
const client = redis.createClient(config);

client.setSync = Meteor.wrapAsync(client.set);
client.getSync = Meteor.wrapAsync(client.get);

client.on("error", error => {
  throw new Meteor.Error("redis-error", "Could not connect to redis server.")
});

client.on("connect", () => {
  console.log("Connected to Redis Server");
});

export default client;
