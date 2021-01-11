import { Promise } from "meteor/promise";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

const _fetchFacebookPageData = ({ url }) => {
  check(url, String);
  let response;
  try {
    response = HTTP.get(url);
  } catch (error) {
    throw new Meteor.Error(error);
  }
  return response;
};

const SUBSCRIPTION_FIELDS = [
  "feed",
  "messages",
  "message_deliveries",
  "message_reads",
  "messaging_postbacks",
  "messaging_optins",
];

const FacebookAccountsHelpers = {
  updateFBSubscription({ facebookAccountId, token }) {
    check(facebookAccountId, String);
    check(token, String);
    try {
      Promise.await(
        FB.api(`${facebookAccountId}/subscribed_apps`, "post", {
          subscribed_fields: SUBSCRIPTION_FIELDS,
          access_token: token,
        })
      );
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(500, "Error trying to subscribe");
    }
  },
  updateInstagramBusinessAccountId({ facebookId, token }) {
    check(facebookId, String);
    check(token, String);

    logger.debug(
      "FacebookAccountsHelpers.updateInstagramBusinessAccountId: called",
      { facebookId }
    );

    const response = Promise.await(
      FB.api(facebookId, {
        fields: ["instagram_business_account"],
        access_token: token,
      })
    );

    if (response.instagram_business_account) {
      const facebookAccount = FacebookAccounts.findOne({ facebookId });

      const response_ig = Promise.await(
        FB.api(response.instagram_business_account.id, {
          fields: ["username"],
          access_token: token,
        })
      );

      let upsertObj;
      if (response_ig && response_ig.username) {
        upsertObj = {
          $set: {
            name: facebookAccount.name,
            instagramBusinessAccountId: response.instagram_business_account.id,
            instagramHandle: response_ig.username,
          },
        };
      }

      FacebookAccounts.upsert({ facebookId }, upsertObj);
    }
  },
  getUserAccounts({ userId }) {
    check(userId, String);

    logger.debug("FacebookAccountsHelpers.getUserAccounts: called", { userId });

    const user = Meteor.users.findOne(userId);
    if (!user) {
      return { error: "This user does not exists" };
    }
    if (!user.services.facebook) {
      return { error: "This user has not accessToken" };
    }

    const accessToken = user.services.facebook.accessToken;

    let data;

    try {
      const response = Promise.await(
        FB.api("me/accounts", {
          fields: ["name", "fan_count", "category", "access_token", "tasks"],
          limit: 10,
          access_token: accessToken,
        })
      );
      data = response.data;
      if (response.paging) {
        let next = response.paging.next;
        while (next !== undefined) {
          let nextPage = _fetchFacebookPageData({ url: next });
          next = nextPage.data.paging ? nextPage.data.paging.next : undefined;
          if (nextPage.statusCode == 200 && nextPage.data.data.length) {
            data = data.concat(nextPage.data.data);
          }
        }
      }
    } catch (error) {
      throw new Meteor.Error(500, "Error trying to fetch your accounts");
    }

    return { result: data };
  },
  disconnectFacebook({ facebookAccountId, token }) {
    try {
      Promise.await(
        FB.api(`${facebookAccountId}/subscribed_apps`, "delete", {
          access_token: token,
        })
      );
    } catch (err) {
      logger.error(err);
    }
  },
  removeAccount({ facebookAccountId, token }) {
    const account = FacebookAccounts.findOne({ facebookId: facebookAccountId });
    if (!account) {
      throw new Meteor.Error(404, "Facebook Account not found");
    }

    this.disconnectFacebook({ facebookAccountId, token });

    Likes.remove({ facebookAccountId });
    Comments.remove({ facebookAccountId });
    Entries.remove({ facebookAccountId });
    FacebookAccounts.remove(account._id);
  },
  getUserAccount({ userId, facebookAccountId }) {
    check(userId, String);
    check(facebookAccountId, String);

    logger.debug("FacebookAccountsHelpers.getUserAccount: called", {
      userId,
      facebookAccountId,
    });

    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error(500, "This user does not exists");
    }
    if (!user.services.facebook) {
      throw new Meteor.Error(500, "Missing accessToken");
    }

    const accessToken = user.services.facebook.accessToken;

    return Promise.await(
      FB.api(facebookAccountId, {
        fields: ["name", "fan_count", "access_token", "category"],
        access_token: accessToken,
      })
    );
  },
  exchangeFBToken({ token }) {
    check(token, String);
    const response = Promise.await(
      FB.api(
        "oauth/access_token",
        Object.assign(
          {
            grant_type: "fb_exchange_token",
            fb_exchange_token: token,
          },
          {
            client_id: Meteor.settings.facebook.clientId,
            client_secret: Meteor.settings.facebook.clientSecret,
          }
        )
      )
    );
    return { result: response.access_token };
  },
  getAccountCampaigns({ facebookId }) {
    check(facebookId, String);
    return Campaigns.find({
      status: { $ne: "suspended" },
      "facebookAccount.facebookId": facebookId,
    }).fetch();
  },
  getFacebookAccount({ facebookId }) {
    logger.debug("FacebookAccountsHelpers.getFacebookAccount called", {
      facebookId,
    });
    return FacebookAccounts.findOne({ facebookId });
  },
  getInstagramAccount({ instagramBusinessAccountId }) {
    logger.debug("FacebookAccountsHelpers.getInstagramAccount called", {
      instagramBusinessAccountId,
    });
    return FacebookAccounts.findOne({ instagramBusinessAccountId });
  },
  fetchFBAccount({ userId, address }) {
    check(userId, String);
    check(address, String);

    const user = Meteor.users.findOne(userId);

    if (!user) {
      throw new Meteor.Error(500, "This user does not exists");
    }
    if (!user.services.facebook) {
      throw new Meteor.Error(500, "Missing accessToken");
    }

    const accessToken = user.services.facebook.accessToken;

    let id = "";

    if (address.indexOf("https://www.facebook.com") == 0) {
      id = address.split("/")[3];
    } else {
      id = address;
    }

    return Promise.await(
      FB.api(id, {
        fields: ["name", "fan_count", "website", "link"],
        access_token: accessToken,
      })
    );
  },
  searchFBAccounts({ userId, q }) {
    check(userId, String);
    check(q, String);

    const user = Meteor.users.findOne(userId);

    if (!user) {
      throw new Meteor.Error(500, "This user does not exists");
    }
    if (!user.services.facebook) {
      throw new Meteor.Error(500, "Missing accessToken");
    }

    const accessToken = user.services.facebook.accessToken;

    return Promise.await(
      FB.api("search", {
        q,
        type: "page",
        fields: ["name", "fan_count", "website", "link"],
        access_token: accessToken,
      })
    );
  },
};

exports.FacebookAccountsHelpers = FacebookAccountsHelpers;
