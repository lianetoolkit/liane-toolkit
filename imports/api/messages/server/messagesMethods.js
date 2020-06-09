import SimpleSchema from "simpl-schema";
import { Promise } from "meteor/promise";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Messages } from "/imports/api/messages/messages.js";
import { MessagesHelpers } from "/imports/api/messages/server/messagesHelpers.js";

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
    const cursor = MessagesHelpers.getFilterQueryCursor({ filters });
    if (!cursor)
      throw new Meteor.Error(400, "No users match the selected filters");
    console.log(cursor.count());
    return false;
  },
});

export const countAudience = new ValidatedMethod({
  name: "messages.countAudience",
  validate: MessagesHelpers.filtersSchema.validator(),
  run(data) {
    const cursor = MessagesHelpers.getFilterQueryCursor({ filters: data });
    if (!cursor) return 0;
    return cursor.count();
  },
});
