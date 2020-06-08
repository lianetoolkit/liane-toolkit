import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people";
import Unresolved from "../pages/Unresolved.jsx";

const UnresolvedSubs = new SubsManager();

export default withTracker((props) => {
  const { campaignId } = props;
  const unresolvedHandle = UnresolvedSubs.subscribe("people.unresolved", {
    campaignId,
  });

  const loading = !unresolvedHandle.ready();
  const people = unresolvedHandle.ready()
    ? People.find({ campaignId, unresolved: true }).fetch()
    : [];

  return {
    loading,
    people,
  };
})(Unresolved);
