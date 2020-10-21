import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { CampaignsHelpers } from "/imports/api/campaigns/server/campaignsHelpers.js";
import { Notifications } from "../notifications.js";
import { sendMail } from "/imports/emails/server/mailer";

const NotificationsHelpers = {
  add({
    campaignId,
    userId,
    text,
    metadata,
    path,
    category,
    dataRef,
    removable,
    sticky,
    skipEmailNotify,
  }) {
    let users = [];
    if (!campaignId && !userId) {
      throw new Meteor.Error(400, "Campaign ID or User ID is required");
    }
    if (userId) {
      const user = Meteor.users.findOne(userId);
      if (!user) {
        throw new Meteor.Error(404, "User not found");
      }
      users.push(user);
    } else if (campaignId) {
      const campaignUsers = CampaignsHelpers.getAdmins({ campaignId });
      users = Meteor.users
        .find({
          _id: { $in: campaignUsers.map((u) => u.userId) },
        })
        .fetch();
    }
    let insert = {};
    if (campaignId) {
      insert.campaignId = campaignId;
    }
    if (text) {
      insert.text = text;
    }
    if (path) {
      insert.path = path;
    }
    if (category) {
      insert.category = category;
    }
    if (dataRef) {
      insert.dataRef = dataRef;
    }
    if (metadata) {
      insert.metadata = metadata;
    }
    if (typeof removable !== "undefined") {
      insert.removable = removable;
    }
    if (typeof sticky !== "undefined") {
      insert.sticky = sticky;
    }
    for (const user of users) {
      insert.userId = user._id;
      Notifications.insert(insert);
      if (!skipEmailNotify) {
        sendMail({
          type: "notification",
          data: {
            user,
            category,
            metadata,
            text,
            path,
          },
          tag: category,
        });
      }
    }
  },
  clear({ campaignId, userId, category, dataRef }) {
    let users = [];
    if (!campaignId && !userId) {
      throw new Meteor.Error(400, "Campaign ID or User ID is required");
    }
    if (userId) {
      const user = Meteor.users.findOne(userId);
      if (!user) {
        throw new Meteor.Error(404, "User not found");
      }
      users.push(user);
    } else if (campaignId) {
      const campaignUsers = CampaignsHelpers.getAdmins({ campaignId });
      users = Meteor.users
        .find({
          _id: { $in: campaignUsers.map((u) => u.userId) },
        })
        .fetch();
    }
    for (const user of users) {
      Notifications.remove({ userId: user._id, category, dataRef });
    }
  },
};

exports.NotificationsHelpers = NotificationsHelpers;
