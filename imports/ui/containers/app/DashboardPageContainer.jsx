import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import DashboardPage from "/imports/ui/pages/DashboardPage.jsx";

const cards = ["users", "proxies"];

export default createContainer(({ currentUser }) => {
  console.log("AdminDashboardPageContainer init", { currentUser });
  let search = {};

  // const counterUsers = Meteor.subscribe("admin.users.counter", { search });
  // const counterAccounts = Meteor.subscribe("admin.serviceAccounts.counter", {
  //   search
  // });
  // const counterProxies = Meteor.subscribe("admin.proxies.counter", { search });
  //
  // search = { status: "Active" };
  // const counterSubscriptions = Meteor.subscribe("admin.subscriptions.counter", {
  //   search
  // });

  // const loading = !counterUsers.ready() && !counterProxies.ready();

  // const counters = [];
  // _.each(cards, card => {
  //   obj = {
  //     name: card,
  //     count: Counts.get(`admin.${card}.counter`)
  //   };
  //   counters.push(obj);
  // });
  return {
    // loading,
    // counters,
    currentUser
  };
}, DashboardPage);
