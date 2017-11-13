import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { HTTP } from "meteor/http";

const options = {
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};
_fb = new Facebook(options);

_fetchFacebookPageData = ({ url }) => {
  check(url, String);

  response = HTTP.get(url);
  return response;
};

const EntriesHelpers = {
  getAccountEntries({ facebookId, accessToken }) {
    check(facebookId, String);
    check(accessToken, String);

    logger.debug("FacebookAccountsHelpers.getAccountEntries called", {
      facebookId
    });

    _fb.setAccessToken(accessToken);
    const response = Promise.await(
      _fb.api("me/feed", {
        fields: [
          "object_id",
          "parent_id",
          "message",
          "link",
          "type",
          "created_time",
          "updated_time"
        ],
        limit: 100
      })
    );

    const _insertBulk = ({ data }) => {
      const bulk = Entries.rawCollection().initializeUnorderedBulkOp();

      for (const entry of data) {
        entry.facebookAccountId = facebookId;
        entry._id = entry.id;
        delete entry.id;
        bulk.insert(entry);
      }

      bulk.execute(function(e, result) {
        // do something with result
        console.info("result", result.nInserted);
      });
    };

    if (response.data.length) {
      _insertBulk({ data: response.data });
      let next = response.paging.next;
      while (next !== undefined) {
        logger.debug("loop next", next);
        let nextPage = _fetchFacebookPageData({ url: next });
        next = nextPage.data.paging ? nextPage.data.paging.next : undefined;
        if (nextPage.statusCode == 200 && nextPage.data.data.length) {
          _insertBulk({ data: nextPage.data.data });
        }
      }
    }

    return;
  }
};

exports.EntriesHelpers = EntriesHelpers;
