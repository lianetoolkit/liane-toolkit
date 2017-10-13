import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import {
  ServiceAccounts
} from "/imports/api/serviceAccounts/serviceAccounts.coffee";
import UserAccounts from "/imports/ui/components/users/detail/UserAccounts.jsx";

export default createContainer(
  ({ userId }) => {
    const accountsHandle = Meteor.subscribe("admin.usersDetail.accounts", {
      userId: userId
    });
    const loading = !accountsHandle.ready();

    const serviceAccounts = ServiceAccounts.find({ userId: userId }, {
      sort: { createdAt: -1 }
    }).fetch();
    return {
      loading,
      userId,
      serviceAccounts
    };
  },
  UserAccounts
);
