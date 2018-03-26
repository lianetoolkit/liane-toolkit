import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { withTracker } from "meteor/react-meteor-data";
import AudienceGeolocationSummary from "/imports/ui/components/audiences/AudienceGeolocationSummary.jsx";

const geolocationSummary = new ReactiveVar(null);
const loading = new ReactiveVar(false);
let current = null;

export default withTracker(props => {
  if (
    !current ||
    (current.params.campaignId !== FlowRouter.current().params.campaignId ||
      current.params.audienceFacebookId !== FlowRouter.current().params.audienceFacebookId)
  ) {
    current = FlowRouter.current();
    loading.set(true);
    Meteor.call(
      "audiences.accountGeolocationSummary",
      {
        campaignId: props.campaignId,
        facebookAccountId: props.facebookAccountId
      },
      (error, data) => {
        if (error) {
          console.warn(error);
        }
        loading.set(false);
        if (JSON.stringify(geolocationSummary.get()) !== JSON.stringify(data)) {
          geolocationSummary.set(data);
        }
      }
    );
  }

  return {
    ...props,
    loading: loading.get(),
    summary: geolocationSummary.get()
  };
})(AudienceGeolocationSummary);
