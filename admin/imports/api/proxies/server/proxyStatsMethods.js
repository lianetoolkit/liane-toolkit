const { ProxyStatsHelpers } = require("./proxyStatsHelpers.js");

Meteor.methods({
  "proxyStats.getDataForChart"({ hours, timeOffset }) {
    logger.debug("proxyStats.getDataForChart: called", { hours, timeOffset });
    check(hours, Match.Maybe(Number));
    check(timeOffset, Match.Maybe(Number));

    this.unblock();

    if (Meteor.settings.public.deployMode === "local") {
      Meteor._sleepForMs(1000);
    }

    const loggedInUser = Meteor.user();
    if (
      !loggedInUser ||
      !Roles.userIsInRole(loggedInUser, ["admin", "staff"])
    ) {
      throw new Meteor.Error(
        "proxyStats.getDataForChart.error.accessDenied",
        "Access denied"
      );
    }

    return ProxyStatsHelpers.getDataForChart({ hours, timeOffset });
  }
});
