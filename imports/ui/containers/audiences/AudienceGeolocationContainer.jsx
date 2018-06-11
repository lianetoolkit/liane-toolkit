import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { withTracker } from "meteor/react-meteor-data";
import AudienceGeolocation from "/imports/ui/components/audiences/AudienceGeolocation.jsx";

const audienceCategory = new ReactiveVar(null);
const loading = new ReactiveVar(false);
let current = null;

export default withTracker(props => {
  // Reset vars when route has changed (ReactiveVar set without a check will cause state change)
  if (
    !current ||
    current.params.campaignId !== FlowRouter.current().params.campaignId ||
    current.params.audienceFacebookId !==
      FlowRouter.current().params.audienceFacebookId ||
    current.params.geolocationId !==
      FlowRouter.current().params.geolocationId ||
    current.params.audienceCategoryId !==
      FlowRouter.current().params.audienceCategoryId
  ) {
    current = FlowRouter.current();
    loading.set(true);
    Meteor.call(
      "audiences.byCategory",
      {
        campaignId: props.campaign._id,
        facebookAccountId: props.facebookAccount.facebookId,
        audienceCategoryId: props.audienceCategoryId
      },
      (error, data) => {
        if (error) {
          console.warn(error);
        }
        loading.set(false);
        if (JSON.stringify(audienceCategory.get()) !== JSON.stringify(data)) {
          audienceCategory.set(data);
        }
      }
    );
  }

  return {
    ...props,
    loading: loading.get(),
    audienceCategory: audienceCategory.get()
  };
})(AudienceGeolocation);
