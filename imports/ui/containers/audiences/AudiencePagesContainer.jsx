import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { withTracker } from "meteor/react-meteor-data";
import AudiencePages from "/imports/ui/components/audiences/AudiencePages.jsx";

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
    current.params.audienceCategoryId !==
      FlowRouter.current().params.audienceCategoryId
  ) {
    current = FlowRouter.current();
    loading.set(true);
    Meteor.call(
      "audiences.pagesByCategory",
      {
        campaignId: props.campaign._id,
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
})(AudiencePages);
