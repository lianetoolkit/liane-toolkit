const ProxiesPackages = new Meteor.Collection("proxies_packages");

ProxiesPackages.Schema = new SimpleSchema({
  packageId: {
    type: String,
    index: 1
  },
  provider: {
    type: String,
    allowedValues: ["myprivateproxy"]
  },
  quantity: {
    type: Number,
    optional: true
  },
  active: {
    type: Boolean,
    optional: true,
    defaultValue: true
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        return this.unset();
      }
    }
  }
});

ProxiesPackages.attachSchema(ProxiesPackages.Schema);

ProxiesPackages.allow({
  insert(userId, doc) {
    return userId && Roles.userIsInRole(userId, ["admin", "staff"]);
  },
  update(userId, doc) {
    return userId && Roles.userIsInRole(userId, ["admin", "staff"]);
  },
  remove(userId, doc) {
    return userId && Roles.userIsInRole(userId, ["admin", "staff"]);
  }
});

exports.ProxiesPackages = ProxiesPackages;
