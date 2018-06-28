import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import PeopleForm from "/imports/ui/pages/people/PeopleForm.jsx";

const PeopleFormSubs = new SubsManager();

export default withTracker(props => {
  const personHandle = PeopleFormSubs.subscribe("people.form.detail", {
    formId: props.formId
  });

  const loading = !personHandle.ready();
  const person = personHandle.ready() ? People.findOne() : null;
  const campaign = personHandle.ready() ? Campaigns.findOne() : null;
  const context = personHandle.ready() ? Contexts.findOne() : null;

  return {
    loading,
    person,
    campaign,
    context
  };
})(PeopleForm);
