import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { ReactiveVar } from "meteor/reactive-var";
import { PeopleIndex } from "/imports/api/facebook/people/people.js";
import PeopleSearchResults from "/imports/ui/components/people/PeopleSearchResults.jsx";

const PeopleSubs = new SubsManager();

export default createContainer(props => {
  const subsHandle = PeopleSubs.subscribe("people.campaignSearch", {
    search: props.search,
    options: { ...props.options }
  });

  const loading = !subsHandle.ready();

  let cursor, people, totalCount;
  if (subsHandle.ready()) {
    cursor = PeopleIndex.search(props.search, { ...props.options });
    people = cursor.fetch();
    totalCount = cursor.count();
  }

  return {
    ...props,
    loading,
    people,
    totalCount
  };
}, PeopleSearchResults);
