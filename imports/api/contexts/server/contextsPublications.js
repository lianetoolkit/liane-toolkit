import { Contexts } from "/imports/api/contexts/contexts.js";

Meteor.publish("contexts.all", function() {
  const currentUser = this.userId;
  if (currentUser) {
    return Contexts.find();
  } else {
    return this.ready();
  }
});
