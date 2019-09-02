import { get } from "lodash";
// import { Promise } from "meteor/promise";

const getNotificationStatus = Meteor.wrapAsync(function(callback) {
  Meteor.call(
    "facebook.accounts.hasSubsMessaging",
    {
      campaignId: Session.get("campaignId")
    },
    function(err, res) {
      callback(err, res);
    }
  );
});

export const isModuleActive = (chatbot, customModules, module) => {
  switch (module) {
    case "notifications":
      return getNotificationStatus() == "APPROVED";
    case "notifications":
    case "proposals":
      return customModules && customModules[module];
    default:
      return get(chatbot, `extra_info.${module}.active`);
  }
};

export default {
  isModuleActive
};
