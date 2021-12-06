import { OAuth } from "meteor/oauth";
import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

export const permissions = [
  "public_profile",
  "email",
  "pages_read_engagement",
  "pages_read_user_content",
  "pages_manage_posts",
  "pages_manage_engagement",
  "pages_manage_metadata",
  "pages_show_list",
  "pages_messaging",
  "pages_messaging_phone_number",
  "pages_messaging_subscriptions",
  "instagram_basic",
  "instagram_manage_comments",
];

export const updatePermissions = (cb) => {
  Facebook.requestCredential(
    {
      requestPermissions: permissions,
    },
    (token) => {
      const secret = OAuth._retrieveCredentialSecret(token) || null;
      Meteor.call(
        "users.setType",
        { type: "campaigner", token, secret },
        (err, res) => {
          if (err) {
            alertStore.add(err);
            cb({});
          } else {
            cb({ token, secret });
          }
        }
      );
    }
  );
};
