import { UsersEvents } from "/imports/api/users/usersEvents.js";
// import { Woopra } from "/imports/api/woopra/woopra.coffee"

const _handleCreate = function({ userId, eventType, extraFields, user }) {
  check(userId, String);
  check(eventType, String);
  check(extraFields, Match.Maybe(Object));
  check(user, Match.Any); // needed for signup event

  const userEventId = UsersEvents.insert({ userId, eventType, extraFields });
  // Woopra.track { userId, eventType, extraFields, user}

  return userEventId;
};

export const UsersEventsHelpers = {
  signup({ user }) {
    logger.info("UsersEventsHelpers.signup", { user });
    check(user, Match.Any);

    const userId = user._id;
    const eventType = "signup";
    return _handleCreate({ userId, eventType, user });
  },

  sendEmail({ userId, emailType }) {
    logger.info("UsersEventsHelpers.sendEmail", { userId, emailType });
    check(userId, String);
    check(emailType, String);

    const eventType = "sendEmail";
    const extraFields = { emailType };
    return _handleCreate({ userId, eventType, extraFields });
  },

  accountsAdd({ userId, serviceAccountId }) {
    check(userId, String);
    check(serviceAccountId, String);
    logger.info("UsersEventsHelpers.accountsAdd", { userId, serviceAccountId });

    const eventType = "accountsAdd";
    const extraFields = { serviceAccountId };
    return _handleCreate({ userId, eventType, extraFields });
  }
};
