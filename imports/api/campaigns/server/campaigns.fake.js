import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import faker from "faker";

Factory.define("campaign", Campaigns, {
  users: function() {
    return [{ userId: faker.random.uuid(), admin: true }];
  },
  contextId: function() {
    return faker.random.uuid();
  },
  name: function() {
    return faker.name.firstName();
  },
  description: function() {
    return faker.name.firstName();
  }
});
