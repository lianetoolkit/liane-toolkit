import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { ReactiveVar } from "meteor/reactive-var";
import { People } from "/imports/api/facebook/people/people.js";
import PeopleSearchResults from "/imports/ui/components/people/PeopleSearchResults.jsx";

const people = new ReactiveVar([]);
const loading = new ReactiveVar(false);
let search = null;
let shouldCall = false;

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("people.campaignSearch", {
    campaignId: props.campaignId,
    search: props.search
  });

  const loading = !subsHandle.ready();

  const people = subsHandle.ready ? People.find().fetch() : null;

  return {
    facebookId: FlowRouter.getParam("facebookId"),
    loading: loading,
    people: people
  };
}, PeopleSearchResults);
