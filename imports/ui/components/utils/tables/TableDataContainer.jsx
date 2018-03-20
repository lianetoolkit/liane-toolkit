import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
import i18n from "meteor/universe:i18n";
import { withTracker } from "meteor/react-meteor-data";
import TableData from "./TableData.jsx";
import {
  prepareSubscriptionFields,
  normalizeFields,
  prepareSearch
} from "./Utils";

const CollectionSubs = new SubsManager();

export default withTracker(props => {
  const defaultLimit = 20;
  const {
    selector,
    collection,
    columns,
    limit,
    orderBy,
    publication,
    extraFields,
    searchableFields,
    activeFilters,
    transform,
    transformCollections
  } = props;
  // console.log("TableDataContainer called");
  let { search } = props;
  const currentUser = Meteor.user();

  const preparedSearch = search
    ? prepareSearch(columns, search, searchableFields)
    : {};
  search = Object.assign(preparedSearch, selector);

  if (activeFilters.length) {
    const preparedFilters = [];
    for (let filter of activeFilters) {
      let newFilter = {};
      newFilter[filter.field] = filter.value;
      preparedFilters.push(newFilter);
    }
    const filters = { $and: preparedFilters };

    search = Object.assign(search, filters);

    // console.log("TableDataContainer", { activeFilters, filters, search });
  }

  let fields = prepareSubscriptionFields(columns, selector);
  if (extraFields) {
    for (let field of extraFields) {
      fields[field] = 1;
    }
  }

  fields = normalizeFields(fields);

  const options = {
    limit: limit ? limit : defaultLimit,
    orderBy: orderBy ? orderBy : { field: "createdAt", ordering: -1 },
    search,
    fields
  };

  const counterHandle = Meteor.subscribe(`${publication}.counter`, {
    search
  });
  const countReady = counterHandle.ready();
  const count = Counts.get(`${publication}.counter`);
  const subsHandle = CollectionSubs.subscribe(publication, options);

  const findOptions = { sort: {}, limit: options.limit, transform };
  findOptions["sort"][options.orderBy.field] = options.orderBy.ordering;
  findOptions["fields"] = fields;

  // console.log("TableDataContainer", { search, findOptions });

  const data = collection.find(search, findOptions).fetch();

  let transformData = [];
  for (const transformCollection of transformCollections) {
    transformData.push(transformCollection.find().fetch());
  }

  const loading = !countReady || (count > 0 && data.length == 0);
  const hasMore = data.length < count;
  const loadingMore = 0 < data.length && data.length < limit;

  return {
    currentUser,
    options,
    loading,
    data,
    count,
    countReady,
    hasMore,
    loadingMore
  };
})(TableData);
