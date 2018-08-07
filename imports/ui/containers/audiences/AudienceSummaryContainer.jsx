import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { withTracker } from "meteor/react-meteor-data";
import AudienceSummary from "/imports/ui/components/audiences/AudienceSummary.jsx";

const summary = new ReactiveVar(null);
const loading = new ReactiveVar(false);
let current = null;

export default withTracker(props => {
  // Reset vars when route has changed (ReactiveVar set without a check will cause state change)
  if (
    !current ||
    current.params.campaignId !== FlowRouter.current().params.campaignId ||
    current.queryParams.account !== FlowRouter.current().queryParams.account
  ) {
    current = FlowRouter.current();
    loading.set(true);
    Meteor.call(
      "audiences.campaignSummary",
      {
        campaignId: props.campaign._id,
        facebookAccountId: props.facebookAccount.facebookId
      },
      (error, data) => {
        if (error) {
          console.warn(error);
        }
        loading.set(false);
        if (JSON.stringify(summary.get()) !== JSON.stringify(data)) {
          summary.set(data);
        }
      }
    );
  }

  return {
    ...props,
    loading: loading.get(),
    summary: summary.get()
  };
})(AudienceSummary);
