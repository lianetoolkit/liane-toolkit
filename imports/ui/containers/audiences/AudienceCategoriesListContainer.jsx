import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { withTracker } from "meteor/react-meteor-data";
import AudienceCategoriesList from "/imports/ui/components/audiences/AudienceCategoriesList.jsx";

const accountSummary = new ReactiveVar([]);
const loading = new ReactiveVar(false);
let currentRoutePath = null;

export default withTracker(props => {
  // Reset vars when route has changed (ReactiveVar set without a check will cause state change)
  if (currentRoutePath !== FlowRouter.current().path) {
    currentRoutePath = FlowRouter.current().path;
    accountSummary.set([]);
    loading.set(true);
  }

  Meteor.call(
    "audiences.accountSummary",
    {
      campaignId: props.campaignId,
      facebookAccountId: props.facebookAccountId
    },
    (error, data) => {
      if (error) {
        console.warn(error);
      }
      if (JSON.stringify(accountSummary.get()) !== JSON.stringify(data)) {
        accountSummary.set(data);
        loading.set(false);
      }
    }
  );

  return {
    loading: loading.get(),
    summary: accountSummary.get()
  };
})(AudienceCategoriesList);
