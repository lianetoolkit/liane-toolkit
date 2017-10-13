const ProxyStats = new Meteor.Collection("proxy_stats");

ProxyStats.Schema = new SimpleSchema({
  proxyId: {
    type: String,
    index: 1
  },
  service: {
    type: String
  },
  success: {
    type: Boolean,
    index: 1
  },
  errorType: {
    type: String,
    optional: true,
    allowedValues: ["ETIMEDOUT", "ECONNRESET", "ESOCKETTIMEDOUT"]
  },
  createdAt: {
    // TTL index
    label: "createdAt",
    type: Date
  }
});

ProxyStats.attachSchema(ProxyStats.Schema);

exports.ProxyStats = ProxyStats;
