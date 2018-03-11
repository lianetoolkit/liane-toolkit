import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { ReactiveVar } from "meteor/reactive-var";
import { PeopleIndex } from "/imports/api/facebook/people/people.js";
import PeopleSearchResults from "/imports/ui/components/people/PeopleSearchResults.jsx";

export default withTracker(props => {
  const subsHandle = PeopleIndex.search(props.search, { ...props.options });
  const loading = !subsHandle.isReady();

  let people, totalCount;
  if (subsHandle.isReady()) {
    people = subsHandle.fetch();
    totalCount = subsHandle.count();
  }

  return {
    loading,
    people,
    totalCount
  };
})(PeopleSearchResults);
