import redis from "redis";

const config = Meteor.settings.redis;
const client = redis.createClient(config);

client.setSync = Meteor.wrapAsync(client.set);
client.getSync = Meteor.wrapAsync(client.get);

client.on("error", error => {
  console.log("Redis Error", error);
});

client.on("connect", () => {
  console.log("Connected to Redis Server");
});

export default client;
