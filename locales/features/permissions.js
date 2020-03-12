const permissions = require("../../imports/utils/campaignPermissions");

let messages = {};

for (feature of permissions.FEATURES) {
  messages[feature] = {
    id: `app.campaign.team.permission.label.${feature}`,
    defaultMessage: feature
  };
}

for (feature of permissions.FEATURES) {
  for (permission in permissions.PERMISSIONS) {
    if (
      permissions.FEATURE_PERMISSION_MAP[feature] &
      permissions.PERMISSIONS[permission]
    ) {
      messages[`${feature}.${permission}`] = {
        id: `app.campaign.team.permission.label.${feature}.${permission}`,
        defaultMessage: permission
      };
    }
  }
}

module.exports = {
  messages: messages,
  list: Object.values(messages)
};
