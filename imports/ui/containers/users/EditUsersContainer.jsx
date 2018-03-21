import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import EditUsersPage from "/imports/ui/pages/admin/users/EditUsersPage.jsx";

const EditUserSubs = new SubsManager();

export default withTracker(props => {
  const subsHandle = EditUserSubs.subscribe("users.detail", {
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
})(EditUsersPage);
