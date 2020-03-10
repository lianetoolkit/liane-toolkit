import { ClientStorage } from "meteor/ostrio:cstorage";
import { FEATURES, PERMISSIONS } from "/imports/utils/campaignPermissions";

export const userCan = (permission, ...features) => {
  const isAdmin = ClientStorage.get("admin");
  if (permission == "admin") return isAdmin;
  // True for any if admin
  if (isAdmin) return true;
  // Check each feature argument (OR statement)
  for (feature of features) {
    if (checkFeaturePermission(feature, permission)) return true;
  }
};

const checkFeaturePermission = (feature, permission) => {
  const userPermissions = ClientStorage.get("permissions");
  // Any permission above "view" allows view
  if (
    PERMISSIONS[permission] == PERMISSIONS["view"] &&
    userPermissions[feature] >= PERMISSIONS["view"]
  ) {
    return true;
  }
  // Regular permission check
  return userPermissions[feature] & PERMISSIONS[permission];
};
