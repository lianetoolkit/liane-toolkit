import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import UsersPage from "/imports/ui/pages/users/UsersPage.jsx";

export default createContainer(({ currentUser }) => {
  // console.log("UsersPageContainer init", { currentUser });
  const loading = false;
  return {
    loading,
    currentUser
  };
}, UsersPage);
