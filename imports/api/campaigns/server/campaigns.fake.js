import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import faker from "faker";

Factory.define("campaign", Campaigns, {
  users: function() {
    return [{ userId: faker.random.uuid(), admin: true }];
  },
  name: function() {
    return faker.name.firstName();
  },
  description: function() {
    return faker.name.firstName();
  }
});
