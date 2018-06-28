import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import PeopleForm from "/imports/ui/pages/people/PeopleForm.jsx";

const PeopleFormSubs = new SubsManager();

export default withTracker(props => {
  let loading = true;
  let person, campaign, context;
  if (props.formId) {
    const personHandle = PeopleFormSubs.subscribe("people.form.detail", {
      formId: props.formId
    });
    loading = !personHandle.ready();
    person = personHandle.ready() ? People.findOne() : null;
    campaign = personHandle.ready() ? Campaigns.findOne() : null;
    context = personHandle.ready() ? Contexts.findOne() : null;
  } else if (props.campaignId) {
    person = {};
    const campaignHandle = PeopleFormSubs.subscribe("campaigns.publicDetail", {
      campaignId: props.campaignId
    });
    loading = !campaignHandle.ready();
    campaign = campaignHandle.ready() ? Campaigns.findOne() : null;
    context = campaignHandle.ready() ? Contexts.findOne() : null;
  }

  return {
    loading,
    person,
    campaign,
    context
  };
})(PeopleForm);
