const permissions = require("../imports/utils/campaignPermissions");

let messages = [];

for (feature of permissions.FEATURES) {
  messages.push({
    id: `app.campaign.team.permission.label.${feature}`,
    defaultMessage: feature
  });
}

for (feature of permissions.FEATURES) {
  for (permission in permissions.PERMISSIONS) {
    if (
      permissions.FEATURE_PERMISSION_MAP[feature] &
      permissions.PERMISSIONS[permission]
    ) {
      messages.push({
        id: `app.campaign.team.permission.label.${feature}.${permission}`,
        defaultMessage: permission
      });
    }
  }
}

module.exports = messages;
