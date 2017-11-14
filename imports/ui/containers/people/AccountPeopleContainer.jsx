import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import AccountPeople from "/imports/ui/components/people/AccountPeople.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("people.byAccount", {
    facebookAccountId: props.facebookId
  });
  const loading = !subsHandle.ready();

  const people = subsHandle.ready()
    ? People.find(
        { facebookAccounts: { $in: [props.facebookId] } },
        { sort: { likesCount: -1 } }
      ).fetch()
    : [];
  console.log(people);

  return {
    loading,
    people
  };
}, AccountPeople);
