import { People } from "/imports/api/facebook/people/people";
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

Picker.route("/subscription/people", (params, req, res, next) => {
  if (req.method !== "POST") {
    return sendError(405, "Method not allowed", res);
  }
  if (!token || !params.query.token || params.query.token !== token) {
    return sendError(401, "Invalid token", res);
  }
  const body = req.body;
  if (body.uid) {
    if (!People.findOne({ facebookId: body.uid })) {
      return sendError(404, "Person not found", res);
    }
    const data = body.data || {};
    let $set = {};
    let $unset = {};
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
    try {
      People.update({ facebookId: body.uid }, { $set, $unset });
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
