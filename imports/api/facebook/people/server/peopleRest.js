import { People } from "/imports/api/facebook/people/people";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts";
import { Campaigns } from "/imports/api/campaigns/campaigns";
import bodyParser from "body-parser";
import { set } from "lodash";

const token = Meteor.settings.webhookToken;

const sendError = (code, msg, res) => {
  res.statusCode = 405;
  res.statusMessage = msg;
  res.end(`${code} - ${msg}`);
  return;
};

Picker.middleware(bodyParser.json());
Picker.middleware(bodyParser.urlencoded({ extended: false }));

Picker.route("/subscription/:pid/people", (params, req, res, next) => {
  if (req.method !== "POST") {
    return sendError(405, "Method not allowed", res);
  }
  if (!token || !params.query.token || params.query.token !== token) {
    return sendError(401, "Invalid token", res);
  }
  if (!params.pid) {
    return sendError(400, "Missing page ID", res);
  }
  const facebookAccount = FacebookAccounts.findOne({ facebookId: params.pid });
  if (!facebookAccount) {
    return sendError(404, "Page not found", res);
  }
  const campaign = Campaigns.findOne({
    "facebookAccount.facebookId": facebookAccount.facebookId
  });
  if (!campaign) {
    return sendError(404, "No campaign found for this page", res);
  }
  const body = req.body;
  const data = body.data || {};
  if (body.uid) {
    if (!People.findOne({ facebookId: body.uid }) && !data.name) {
      return sendError(
        404,
        "Person not found. Name is required for creating new person entry",
        res
      );
    }
    let $set = {};
    let $unset = {};
    let $setOnInsert = {
      campaignId: campaign._id,
      facebookAccountId: facebookAccount.facebookId
    };
    if (data.hasOwnProperty("name")) {
      $setOnInsert["name"] = data.name;
    }
    if (data.hasOwnProperty("donor")) {
      $set["campaignMeta.donor"] = data.donor;
    }
    if (data.hasOwnProperty("volunteer")) {
      $set["campaignMeta.volunteer"] = data.volunteer;
    }
    if (data.hasOwnProperty("email")) {
      $set["campaignMeta.contact.email"] = data.email;
    }
    if (data.hasOwnProperty("phone")) {
      $set["campaignMeta.contact.cellphone"] = data.phone;
    }
    if (body.hasOwnProperty("status")) {
      if (!body.status || body.status == null || body.status == undefined) {
        $unset["chatbotStatus"] = "";
      } else {
        $set["chatbotStatus"] = body.status;
      }
    }
    const modifier = { $setOnInsert, $set, $unset };
    try {
      People.upsert(
        {
          campaignId: campaign._id,
          facebookAccountId: facebookAccount.facebookId,
          facebookId: body.uid
        },
        modifier
      );
    } catch (err) {
      return sendError(
        err.sanitizedError.error,
        err.sanitizedError.reason,
        res
      );
    } finally {
      res.statusCode = 201;
      res.end();
      return;
    }
  }
  return sendError(400, "Bad request", res);
});
