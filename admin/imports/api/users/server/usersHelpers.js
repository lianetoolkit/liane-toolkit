const UsersHelpers = {
  supervise({ userId }) {
    check(userId, String);
    logger.info("UsersHelpers.supervise: called", { userId });
    const user = Meteor.users.findOne(userId);
  }
};

exports.UsersHelpers = UsersHelpers;
