import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people";
import PeopleSinglePage from "../pages/PeopleSingle.jsx";

const PersonSubs = new SubsManager();

export default withTracker(props => {
  const { personId } = props;
  const PersonHandle = PersonSubs.subscribe("people.detail", {
    personId
  });

  const loading = !PersonHandle.ready();
  const person = PersonHandle.ready() ? People.findOne(personId) : null;

  return {
    loading,
    person
  };
})(PeopleSinglePage);
