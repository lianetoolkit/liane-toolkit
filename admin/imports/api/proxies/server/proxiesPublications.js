import { Proxies } from "../proxies.js";
import { ProxiesPackages } from "../proxiesPackages.js";
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

Meteor.publish("admin.proxies", function({ search, limit, orderBy, fields }) {
  this.unblock();
  // Meteor._sleepForMs 2000
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin", "staff"])) {
    const options = {
      sort: {},
      limit: Math.min(limit, 1000),
      fields
    };
    options["sort"][orderBy.field] = orderBy.ordering;
    return Proxies.find(search, options);
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("admin.proxies.counter", function({ search }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin", "staff"])) {
    Counts.publish(this, "admin.proxies.counter", Proxies.find(search));
    return;
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("admin.proxiesPackages", function({
  search,
  limit,
  orderBy,
  fields
}) {
  this.unblock();
  // Meteor._sleepForMs 2000
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin", "staff"])) {
    const options = {
      sort: {},
      limit: Math.min(limit, 1000),
      fields
    };
    options["sort"][orderBy.field] = orderBy.ordering;
    return ProxiesPackages.find(search, options);
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("admin.proxiesPackages.counter", function({ search }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin", "staff"])) {
    Counts.publish(
      this,
      "admin.proxiesPackages.counter",
      ProxiesPackages.find(search)
    );
    return;
  } else {
    this.stop();
    return;
  }
});
