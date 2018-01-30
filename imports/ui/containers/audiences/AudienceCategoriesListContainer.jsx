import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { createContainer } from "meteor/react-meteor-data";
import AudienceCategoriesList from "/imports/ui/components/audiences/AudienceCategoriesList.jsx";

const accountSummary = new ReactiveVar([]);

export default createContainer(props => {

  Meteor.call("audiences.accountSummary", {
    campaignId: props.campaignId,
    facebookAccountId: props.facebookAccountId
  }, (error, data) => {
    if (error) {
      console.warn(error);
    }
    if (JSON.stringify(accountSummary.get()) !== JSON.stringify(data)) {
      accountSummary.set(data);
    }
  });

  return {
    summary: accountSummary.get()
  };
}, AudienceCategoriesList);
