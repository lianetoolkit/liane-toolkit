import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import PeopleForm from "/imports/ui2/pages/PeopleForm.jsx";
import { set } from "lodash";

const PeopleFormSubs = new SubsManager();

export default withTracker(props => {
  let loading = true;
  let person, campaign;
  let personData = {};
  if (props.formId || props.psid) {
    let selector = {};
    if (props.formId) selector = { formId: props.formId };
    if (props.psid) selector = { psid: props.psid };
    const personHandle = PeopleFormSubs.subscribe(
      "people.form.detail",
      selector
    );
    loading = !personHandle.ready();
    person = personHandle.ready() ? People.findOne() : null;
    campaign = personHandle.ready() ? Campaigns.findOne() : null;
  } else if (props.campaignId || props.campaignSlug) {
    person = {};
    let subsProps;
    if (props.campaignId) {
      subsProps = { campaignId: props.campaignId };
    } else if (props.campaignSlug) {
      subsProps = { slug: props.campaignSlug };
    }
    const campaignHandle = PeopleFormSubs.subscribe(
      "campaigns.publicDetail",
      subsProps
    );
    loading = !campaignHandle.ready();
    campaign = campaignHandle.ready() ? Campaigns.findOne() : null;
  } else {
    loading = false;
  }
  if (props.donor) {
    set(personData, "donor", true);
  }
  if (props.volunteer) {
    set(personData, "volunteer", true);
  }
  return {
    loading,
    person,
    personData,
    campaign
  };
})(PeopleForm);
