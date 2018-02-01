import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { createContainer } from "meteor/react-meteor-data";
import AudienceCategory from "/imports/ui/components/audiences/AudienceCategory.jsx";

const audienceCategory = new ReactiveVar(null);

export default createContainer(props => {

  Meteor.call("audiences.byCategory", {
    campaignId: props.campaignId,
    facebookAccountId: props.facebookAccountId,
    audienceCategoryId: props.audienceCategoryId
  }, (error, data) => {
    if (error) {
      console.warn(error);
    }
    if (JSON.stringify(audienceCategory.get()) !== JSON.stringify(data)) {
      audienceCategory.set(data);
    }
  });

  return {
    audienceCategory: audienceCategory.get()
  };
}, AudienceCategory);
