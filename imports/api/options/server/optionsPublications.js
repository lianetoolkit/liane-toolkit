import { Options } from "/imports/api/options/options.js";

Meteor.publish("options.all", function() {
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return Options.find();
  } else {
    return this.ready();
  }
});

Meteor.publish("options.single", function({ name }) {
  const currentUser = this.userId;
  const cursor = Options.find({ name });
  const option = Options.findOne({ name });
  if (option && option.private) {
    if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
      return cursor;
    } else {
      return this.ready();
    }
  } else {
    return cursor;
  }
});
