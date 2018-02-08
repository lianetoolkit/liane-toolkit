import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { ReactiveVar } from "meteor/reactive-var";
import PeopleSearchResults from "/imports/ui/components/people/PeopleSearchResults.jsx";

const people = new ReactiveVar([]);
const loading = new ReactiveVar(false);
let search = null;

export default createContainer(props => {
  if (search !== props.search) {
    search = props.search;
    people.set([]);
    loading.set(true);
  }

  Meteor.call(
    "people.campaignSearch",
    {
      campaignId: props.campaignId,
      search: props.search
    },
    (error, data) => {
      if (error) {
        console.warn(error);
      }
      loading.set(false);
      if (JSON.stringify(people.get()) !== JSON.stringify(data)) {
        people.set(data);
      }
    }
  );

  return {
    loading: loading.get(),
    people: people.get()
  };
}, PeopleSearchResults);
