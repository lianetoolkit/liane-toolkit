import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";

const options = {
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};
const _fb = new Facebook(options);

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
  getUserAccounts({ userId }) {
    check(userId, String);

    logger.info("FacebookAccountsHelpers.getUserAccounts: called", { userId });

    const user = Meteor.users.findOne(userId);
    if (!user) {
      return { error: "This user does not exists" };
    }
    if (!user.services.facebook) {
      return { error: "This user has not accessToken" };
    }

    const accessToken = user.services.facebook.accessToken;

    _fb.setAccessToken(accessToken);

    const response = Promise.await(_fb.api("me/accounts", { limit: 10 }));
    let data = response.data;
    let next = response.paging.next;
    while (next !== undefined) {
      let nextPage = _fetchFacebookPageData({ url: next });
      next = nextPage.data.paging ? nextPage.data.paging.next : undefined;
      if (nextPage.statusCode == 200 && nextPage.data.data.length) {
        data = data.concat(nextPage.data.data);
      }
    }

    return { result: data };
  },
  getUserAccount({ userId, facebookAccountId }) {
    check(userId, String);
    check(facebookAccountId, String);

    logger.info("FacebookAccountsHelpers.getUserAccount: called", {
      userId,
      facebookAccountId
    });

    const user = Meteor.users.findOne(userId);
    if (!user) {
      return { error: "This user does not exists" };
    }
    if (!user.services.facebook) {
      return { error: "This user has not accessToken" };
    }

    const accessToken = user.services.facebook.accessToken;

    return Promise.await(
      _fb.api(facebookAccountId, {
        fields: ["name", "access_token", "category"],
        access_token: accessToken,
        limit: 10
      })
    );
  },
  exchangeFBToken({ token }) {
    check(token, String);
    const response = Promise.await(
      _fb.api(
        "oauth/access_token",
        Object.assign(
          {
            grant_type: "fb_exchange_token",
            fb_exchange_token: token
          },
          options
        )
      )
    );
    return { result: response.access_token };
  }
};

exports.FacebookAccountsHelpers = FacebookAccountsHelpers;
