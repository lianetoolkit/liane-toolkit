const UsersUtils = {
  changeRole({ userId, role }) {
    check(userId, String);
    check(role, String);

    if (Roles.userIsInRole(userId, ["admin"])) {
      Roles.addUsersToRoles(userId, role);
      return;
    }

    Roles.setUserRoles(userId, role);
    Meteor.setTimeout(() => MailChimp.updateUser({ userId }), 0);
  }
};

exports.UsersUtils = UsersUtils;
