import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { FlowRouter } from "meteor/kadira:flow-router";
import { connect } from "react-redux";

import AppLayout from "../layouts/AppLayout.jsx";

export default withTracker(({ content }) => {
  const user = Meteor.user();
  // console.log(user, Meteor.userId() !== null, Meteor.status().connected);
  return {
    user,
    connected: Meteor.status().connected,
    isLoggedIn: Meteor.userId() !== null,
    content: content,
    routeName: FlowRouter.getRouteName()
  };
})(AppLayout);
