import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people";
import Unresolved from "../pages/Unresolved.jsx";

const UnresolvedSubs = new SubsManager();

export default withTracker((props) => {
  const { campaignId } = props;

  const unresolvedHandle = UnresolvedSubs.subscribe("people.unresolved", {
    campaignId,
  });
  const unresolvedHandleCounter = UnresolvedSubs.subscribe("people.unresolved.count", {
    campaignId,
  });
  const options = {
    fields: {
      name: true,
      campaignMeta: true,
      source: true,
      createdAt: true,
      related: true,
    },
    transform: (person) => {
      person.children = [];
      if (person.related && person.related.length > 0) {
        person.children = People.find({ _id: { $in: person.related } }).fetch();
      }
      return person;
    },
  };
  const peopleCounter = unresolvedHandleCounter.ready() ? People.find({
    campaignId,
    unresolved: true,
  }).count() : 0
  const loading = !unresolvedHandle.ready();
  const people = unresolvedHandle.ready()
    ? People.find(
      {
        campaignId,
        unresolved: true,
        related: { $exists: true },
      },
      options
    ).fetch()
    : [];

  return {
    loading,
    people,
    peopleCounter
  };
})(Unresolved);
