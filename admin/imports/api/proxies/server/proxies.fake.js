import { Proxies } from "../proxies.js";

// Testing part.
const faker = require("faker");
const { Factory } = require("meteor/dburles:factory");

Factory.define("proxy", Proxies, {
  ip: () => "64.120.61.5",
  portHttp: () => 29842,
  login: () => "jlopez02",
  password: () => "YJngdKqR",
  countryCode: () => "us",
  provider: () => "myprivateproxy",
  packageId: () => "63365",
  active: () => true,
  services: () => ({
    instagram: { active: true, accountsNumber: 0, accounts: [] },
    twitter: { active: true, accountsNumber: 0, accounts: [] }
  }),
  createdAt: () => new Date()
});
