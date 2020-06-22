export const APP_NAME = Meteor.settings.public.appName;

export const addTitle = function(title) {
  DocHead.setTitle(title);
};

const routesToMaintain = [
  "App.campaignAudience",
  "App.campaignPeople.activity"
];

const shouldScrollTop = context => {
  const old = context.oldRoute ? context.oldRoute.name : "";
  const cur = context.route.name;
  let should = true;
  for (const name of routesToMaintain) {
    if (old.indexOf(name) == 0 && cur.indexOf(name) == 0) {
      should = false;
    }
  }
  return should;
};

export const trackRouteEntry = context => {
  // const node = document.getElementById("app-content");
  // if (node && shouldScrollTop(context)) node.scrollTop = 0;
  if (shouldScrollTop(context)) window.scrollTo(0, 0);
  Meteor.setTimeout(() => {
    const connectionId = Meteor.connection._lastSessionId;
    const userId = Meteor.userId();
    const campaignId = Session.get("campaignId");
    if (userId && campaignId) {
      Meteor.call("log", {
        type: "view",
        path: context.path,
        campaignId
      });
    }
  }, 3000);
};
