export const APP_NAME = Meteor.settings.public.appName;

export const addTitle = function(title) {
  DocHead.setTitle(title);
};

const routesToMaintain = ["App.campaignAudience"];

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
    const userId = Meteor.userId();
    if (userId) {
      // Woopra.track({ userId });
      // console.log("trackRouteEntry");
    }
  }, 3000);
};
