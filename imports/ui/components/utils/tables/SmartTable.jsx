import React, { Component } from "react";
import Proptypes from "prop-types";
import { Meteor } from "meteor/meteor";
import TableDataContainer from "./TableDataContainer.jsx";

const defaultPageSize = 25;

export default class SmartTable extends Component {
  constructor(props) {
    super(props);
    // console.log("SmartTable init", { props });
    this.state = {
      limit: props.limit ? props.limit : defaultPageSize,
      orderBy: props.orderBy,
      search: "",
      activeFilters: []
    };
  }
  handleOptions = options => {
    this.setState(options);
  };
  loadMore = () => {
    const pageSize = this.props.limit ? this.props.limit : defaultPageSize;
    this.setState((prevState, props) => {
      return { limit: prevState.limit + pageSize };
    });
  };
  toggleFilter = filter => {
    this.setState((prevState, props) => {
      const activeFiltersNames = _.pluck(prevState.activeFilters, "name");
      const index = activeFiltersNames.indexOf(filter.name);
      let activeFilters = prevState.activeFilters;
      if (index == -1) {
        activeFilters = activeFilters.concat(filter);
      } else {
        activeFilters.splice(index, 1);
      }
      return { activeFilters };
    });
  };
  render() {
    const { activeFilters } = this.state;
    // console.log({ activeFilters });
    const {
      columns,
      title,
      collection,
      publication,
      selector,
      extraFields,
      showLoadMore,
      searchableFields,
      hideHeader,
      filters,
      transform,
      transformCollections
    } = this.props;
    // console.log({ selector });
    return (
      <TableDataContainer
        title={title}
        columns={columns}
        collection={collection}
        selector={selector || {}}
        filters={filters || []}
        transform={transform || null}
        transformCollections={transformCollections || []}
        activeFilters={this.state.activeFilters}
        toggleFilter={this.toggleFilter}
        extraFields={extraFields || []}
        searchableFields={searchableFields || []}
        publication={publication}
        limit={this.state.limit}
        orderBy={this.state.orderBy}
        search={this.state.search}
        changeOptions={this.handleOptions}
        loadMore={this.loadMore}
        showLoadMore={showLoadMore === undefined ? true : showLoadMore}
        hideHeader={hideHeader || false}
      />
    );
  }
}

SmartTable.propTypes = {
  publication: Proptypes.string,
  collection: Proptypes.object,
  selector: Proptypes.object,
  columns: Proptypes.array,
  title: Proptypes.string,
  orderBy: Proptypes.object,
  showLoadMore: Proptypes.bool
};
