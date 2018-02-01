import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { createContainer } from "meteor/react-meteor-data";
import AudienceCategory from "/imports/ui/components/audiences/AudienceCategory.jsx";

const audienceCategory = new ReactiveVar(null);
const loading = new ReactiveVar(false);
let currentRoutePath = null;

export default createContainer(props => {
  // Reset vars when route has changed (ReactiveVar set without a check will cause state change)
  if (currentRoutePath !== FlowRouter.current().path) {
    currentRoutePath = FlowRouter.current().path;
    audienceCategory.set(null);
    loading.set(true);
  }

  Meteor.call(
    "audiences.byCategory",
    {
      campaignId: props.campaignId,
      facebookAccountId: props.facebookAccountId,
      audienceCategoryId: props.audienceCategoryId
    },
    (error, data) => {
      if (error) {
        console.warn(error);
      }
      if (JSON.stringify(audienceCategory.get()) !== JSON.stringify(data)) {
        audienceCategory.set(data);
        loading.set(false);
      }
    }
  );

  return {
    loading: loading.get(),
    audienceCategory: audienceCategory.get()
  };
}, AudienceCategory);
