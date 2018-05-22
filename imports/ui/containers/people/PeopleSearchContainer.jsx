import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { ReactiveVar } from "meteor/reactive-var";
import { People } from "/imports/api/facebook/people/people.js";
import PeopleSearchResults from "/imports/ui/components/people/PeopleSearchResults.jsx";

const people = new ReactiveVar(null);
const count = new ReactiveVar(0);
const loading = new ReactiveVar(false);
const loadingCount = new ReactiveVar(false);
let current = null;
let currentParams = null;
let currentQueryParams = null;

const getQueryParams = props => {
  return {
    search: { ...props.search },
    campaignId: props.campaignId,
    facebookId: props.facebookId
  };
};

const getAllParams = props => {
  return {
    ...getQueryParams(props),
    options: props.options
  };
};

export default withTracker(props => {
  // Fetch count
  if (
    !currentQueryParams ||
    JSON.stringify(currentQueryParams) !== JSON.stringify(getQueryParams(props))
  ) {
    currentQueryParams = getQueryParams(props);
    loadingCount.set(true);
    Meteor.call(
      "people.search.count",
      {
        campaignId: props.campaignId,
        query: props.search,
        options: props.options
      },
      (error, data) => {
        loadingCount.set(false);
        if (JSON.stringify(count.get()) !== JSON.stringify(data)) {
          count.set(data);
        }
      }
    );
  }
  // Fetch people
  if (
    !currentParams ||
    JSON.stringify(currentParams) !== JSON.stringify(getAllParams(props))
  ) {
    currentParams = getAllParams(props);
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
  }
  return {
    loading: loading.get(),
    loadingCount: loadingCount.get(),
    people: people.get(),
    count: count.get()
  };
})(PeopleSearchResults);
