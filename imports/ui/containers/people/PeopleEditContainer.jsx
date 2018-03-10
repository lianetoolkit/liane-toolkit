import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { People } from "/imports/api/facebook/people/people.js";
import PeopleEdit from "/imports/ui/pages/people/PeopleEdit.jsx";

export default createContainer(props => {
  const personHandle = Meteor.subscribe("people.detail", {
    personId: props.personId
  });

  const loading = !personHandle.ready();

  const person = personHandle.ready() ? People.findOne(props.personId) : null;

  return {
    loading,
    person
  };
}, PeopleEdit);
