const Proxies = new Meteor.Collection("proxies");

Proxies.StatsSchema = new SimpleSchema({
  total: {
    type: Number
  },
  success: {
    type: Number
  },
  successRatio: {
    type: Number,
    decimal: true
  }
});

Proxies.ServiceSchema = new SimpleSchema({
  accounts: {
    type: [String],
    optional: true
  },
  accountsCount: {
    type: Number,
    optional: true,
    defaultValue: 0
  }
});

Proxies.ServicesSchema = new SimpleSchema({
  instagram: {
    type: Proxies.ServiceSchema
  }
});

Proxies.Schema = new SimpleSchema({
  packageId: {
    type: String,
    index: 1
  },
  provider: {
    type: String,
    index: 1,
    allowedValues: ["myprivateproxy"]
  },
  ip: {
    type: String,
    index: 1
  },
  portHttp: {
    type: Number
  },
  login: {
    type: String,
    optional: true
  },
  password: {
    type: String,
    optional: true
  },
  countryCode: {
    type: String,
    defaultValue: "us",
    optional: true
  },
  active: {
    type: Boolean,
    defaultValue: true
  },
  services: {
    type: Proxies.ServicesSchema,
    optional: true
  },
  stats: {
    type: Proxies.StatsSchema,
    optional: true
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

Proxies.attachSchema(Proxies.Schema);

Proxies.helpers({
  url() {
    if (this.login != null && this.password != null) {
      return `http://${this.login}:${this.password}@${this.ip}:${this
        .portHttp}`;
    } else {
      return `http://${this.ip}:${this.portHttp}`;
    }
  }
});

Proxies.allow({
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

exports.Proxies = Proxies;
