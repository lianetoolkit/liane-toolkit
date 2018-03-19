import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import EditUsersPage from "/imports/ui/pages/admin/users/EditUsersPage.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("users.detail", {
    userId: props.userId
  });

  const loading = !subsHandle.ready();

  const user = subsHandle.ready() && props.userId
    ? Meteor.users.findOne(props.userId)
    : null;

  return {
    loading,
    user
  };
}, EditUsersPage);
