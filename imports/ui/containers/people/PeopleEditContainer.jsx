import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import PeopleEdit from "/imports/ui/pages/people/PeopleEdit.jsx";

const PeopleEditSubs = new SubsManager();

export default withTracker(props => {
  let loading = false;
  let person = {};
  if (props.personId) {
    const personHandle = PeopleEditSubs.subscribe("people.detail", {
      personId: props.personId
    });
    loading = !personHandle.ready();
    person = personHandle.ready() ? People.findOne(props.personId) : null;
  }

  return {
    loading,
    person
  };
})(PeopleEdit);
