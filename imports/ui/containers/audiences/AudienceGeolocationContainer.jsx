import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { withTracker } from "meteor/react-meteor-data";
import AudienceGeolocation from "/imports/ui/components/audiences/AudienceGeolocation.jsx";

const geolocation = new ReactiveVar(null);
const loading = new ReactiveVar(false);
let currentRoutePath = null;

export default withTracker(props => {
  // Reset vars when route has changed (ReactiveVar set without a check will cause state change)
  if (currentRoutePath !== FlowRouter.current().path) {
    currentRoutePath = FlowRouter.current().path;
    loading.set(true);
  }

  Meteor.call(
    "audiences.byGeolocation",
    {
      campaignId: props.campaign._id,
      facebookAccountId: props.facebookAccount.facebookId,
      geolocationId: props.geolocationId
    },
    (error, data) => {
      if (error) {
        console.warn(error);
      }
      if (JSON.stringify(geolocation.get()) !== JSON.stringify(data)) {
        geolocation.set(data);
        loading.set(false);
      }
    }
  );

  return {
    ...props,
    loading: loading.get(),
    geolocation: geolocation.get()
  };
})(AudienceGeolocation);
