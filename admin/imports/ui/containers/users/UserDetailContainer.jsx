import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import {
  ServiceAccounts
} from "/imports/api/serviceAccounts/serviceAccounts.coffee";
import UserDetailPage from "/imports/ui/pages/users/UserDetailPage.jsx";

export default createContainer(
  ({ currentUser }) => {
    const userId = FlowRouter.getParam("userId");
    const userHandle = Meteor.subscribe("admin.usersDetail", { userId });
    const loading = !userHandle.ready();

    const serviceAccounts = ServiceAccounts.find({ userId }, {
      sort: { createdAt: -1 }
    }).fetch();
    const user = Meteor.users.findOne(userId);
    return {
      loading,
      user,
      userId,
      serviceAccounts
    };
  },
  UserDetailPage
);
