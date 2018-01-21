import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import AccountsLayout from "/imports/ui/layouts/accounts/AccountsLayout.jsx";
import { FlowRouter } from "meteor/kadira:flow-router";

export default createContainer(({ content }) => {
  const user = Meteor.user();
  return {
    user,
    connected: Meteor.status().connected,
    isLoggedIn: Meteor.userId() !== null,
    content: content,
    routeName: FlowRouter.getRouteName()
  };
}, AccountsLayout);
