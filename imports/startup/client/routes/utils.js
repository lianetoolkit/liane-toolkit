export const APP_NAME = Meteor.settings.public.appName;

export const addTitle = function(title) {
  DocHead.setTitle(title);
};

export const trackRouteEntry = () => {
  const node = document.getElementById("app-content");
  if (node) node.scrollTop = 0;
  Meteor.setTimeout(() => {
    const userId = Meteor.userId();
    if (userId) {
      // Woopra.track({ userId });
      // console.log("trackRouteEntry");
    }
  }, 3000);
};
