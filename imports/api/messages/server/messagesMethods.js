import SimpleSchema from "simpl-schema";
import MarkdownIt from "markdown-it";
import { Promise } from "meteor/promise";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Messages } from "/imports/api/messages/messages.js";
import { MessagesHelpers } from "/imports/api/messages/server/messagesHelpers.js";
import { sendMail } from "/imports/emails/server/mailer";
import { NotificationsHelpers } from "/imports/api/notifications/server/notificationsHelpers";

const markdown = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
});

export const getMessage = new ValidatedMethod({
  name: "messages.get",
  validate: new SimpleSchema({
    messageId: {
      type: String,
    },
  }).validator(),
  run({ messageId }) {
    logger.debug("messages.get called", { messageId });
    return Messages.findOne(messageId, { fields: { title: 1, content: 1 } });
  },
});

export const createMessage = new ValidatedMethod({
  name: "messages.new",
  validate: new SimpleSchema({
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    filters: {
      type: MessagesHelpers.filtersSchema,
    },
  }).validator(),
  run({ title, content, filters }) {
    logger.debug("messages.new called", { title });

    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }

    if (filters.target == "campaigns") {
      delete filters.userId;
      delete filters.userLanguage;
      delete filters.userType;
    }
    if (filters.target == "users") {
      delete filters.campaignId;
      delete filters.campaignAdmins;
      delete filters.campaignType;
      delete filters.campaignCountry;
      delete filters.campaignGeolocation;
      delete filters.campaignOffice;
    }

    const cursor = MessagesHelpers.getFilterQueryCursor({ filters });
    if (!cursor)
      throw new Meteor.Error(400, "No users match the selected filters");
    if (!content) throw new Meteor.Error(400, "Content is required");
    content = markdown.render(content);
    let insertDoc = {
      title,
      content,
      type: filters.target,
      recipientCount: cursor.count(),
      recipientQuery: filters,
    };
    const messageId = Messages.insert(insertDoc);
    const emails = MessagesHelpers.createEmail({
      messageId,
      title,
      content,
      filters,
    });

    const getEmailData = (language) => {
      language = language || "en";
      const email = emails[language] || emails["en"];
      return { ...email };
    };

    cursor.forEach((user) => {
      const email = getEmailData(user.userLanguage);
      if (email && email.body) {
        email.body = email.body.replace("%NAME%", user.name);
        NotificationsHelpers.add({
          userId: user._id,
          text: title,
          dataRef: messageId,
          path: `/messages/${messageId}`,
          skipEmailNotify: true,
        });
        sendMail({
          subject: email.subject,
          body: email.body,
          data: { user },
          tag: "message",
        });
      }
    });

    return messageId;
  },
});

export const countAudience = new ValidatedMethod({
  name: "messages.countAudience",
  validate: MessagesHelpers.filtersSchema.validator(),
  run(data) {
    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }
    const cursor = MessagesHelpers.getFilterQueryCursor({ filters: data });
    if (!cursor) return 0;
    return cursor.count();
  },
});

export const queryCount = new ValidatedMethod({
  name: "messages.queryCount",
  validate: new SimpleSchema({
    query: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ query }) {
    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }
    return Messages.find(query || {}).count();
  },
});
