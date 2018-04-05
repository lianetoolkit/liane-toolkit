import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { ReactiveVar } from "meteor/reactive-var";
import { People } from "/imports/api/facebook/people/people.js";
import PeopleSearchResults from "/imports/ui/components/people/PeopleSearchResults.jsx";

const people = new ReactiveVar(null);
const count = new ReactiveVar(0);
const loading = new ReactiveVar(false);
let current = null;

export default withTracker(props => {
  if (!current || JSON.stringify(current) !== JSON.stringify(props)) {
    current = { ...props };
    loading.set(true);
    Meteor.call(
      "people.search",
      {
        campaignId: props.campaignId,
        query: props.search,
        options: props.options
      },
      (error, data) => {
        loading.set(false);
        if (JSON.stringify(people.get()) !== JSON.stringify(data)) {
          people.set(data);
        }
      }
    );
    Meteor.call(
      "people.search.count",
      {
        campaignId: props.campaignId,
        query: props.search,
        options: props.options
      },
      (error, data) => {
        if (JSON.stringify(count.get()) !== JSON.stringify(data)) {
          count.set(data);
        }
      }
    );
  }
  return {
    loading: loading.get(),
    people: people.get(),
    count: count.get()
  };
})(PeopleSearchResults);
