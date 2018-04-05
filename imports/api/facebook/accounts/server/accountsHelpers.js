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

const FacebookAccountsHelpers = {
  removeAccount({ facebookAccountId }) {
    const account = FacebookAccounts.findOne({ facebookId: facebookAccountId });
    if (!account) {
      throw new Meteor.Error(404, "Facebook Account not found");
    }

    Likes.remove({ facebookAccountId });
    Comments.remove({ facebookAccountId });
    Entries.remove({ facebookAccountId });
    FacebookAccounts.remove(account._id);
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
          fields: ["name", "fan_count", "category", "access_token"],
          limit: 10,
          access_token: accessToken
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
  getUserAccount({ userId, facebookAccountId }) {
    check(userId, String);
    check(facebookAccountId, String);

    logger.debug("FacebookAccountsHelpers.getUserAccount: called", {
      userId,
      facebookAccountId
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
        access_token: accessToken
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
            fb_exchange_token: token
          },
          {
            version: "v2.12",
            client_id: Meteor.settings.facebook.clientId,
            client_secret: Meteor.settings.facebook.clientSecret
          }
        )
      )
    );
    return { result: response.access_token };
  },
  getAccountCampaigns({ facebookId }) {
    check(facebookId, String);
    return Campaigns.find({
      accounts: { $elemMatch: { facebookId } }
    }).fetch();
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
        access_token: accessToken
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
        access_token: accessToken
      })
    );
  }
};

exports.FacebookAccountsHelpers = FacebookAccountsHelpers;
