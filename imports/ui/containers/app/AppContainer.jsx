import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import App from "/imports/ui/layouts/app/App.jsx";

export default createContainer(() => {
  const currentUser = Meteor.user();
  const userHandle = Meteor.subscribe("users.data");
  const loading = !userHandle.ready();

  return {
    currentUser,
    loading,
    connected: Meteor.status().connected
  };
}, App);
