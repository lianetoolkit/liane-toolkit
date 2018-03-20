import React, { Component } from "react";
import Proptypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
import i18n from "meteor/universe:i18n";
import LoadingBlock from "/imports/ui/components/utils/LoadingBlock.jsx";
import SearchBox from "./SearchBox.jsx";
import { cleanFieldName } from "./Utils";
// import { Glyphicon } from "react-bootstrap";
import { booleanToIcon } from "/imports/ui/utils/utils.jsx";
import moment from "moment";
import {
  Table,
  Label,
  Menu,
  Icon,
  Input,
  Button,
  Segment
} from "semantic-ui-react";

export default class TableData extends Component {
  constructor(props) {
    super(props);
    // console.log("TableData", props);
  }
  getFieldName(obj, fullField) {
    let field = cleanFieldName(fullField);
    const result = obj[field];
    if (_.isString(result)) {
      return result;
    }
    if (_.isBoolean(result)) {
      return booleanToIcon(result);
    }
    if (_.isNumber(result)) {
      return result;
    }
    if (_.isDate(result)) {
      return moment(result).fromNow();
    }
    if (_.isArray(result)) {
      let chips = "";
      _.each(result, (data, key) => {
        chips += _.values(data);
      });
      return chips;
    }
    if (_.isObject(result)) {
      let chips = "";
      _.each(_.values(result), data => {
        if (_.isString(data)) {
          const subField = fullField.replace(field, "").replace(".", "");
          chips = result[subField];
          return;
        }
        chips += data;
      });
      return chips;
    }
    return result;
  }
  loadMore = () => {
    this.props.loadMore();
  };
  handleOrderBy(field) {
    let ordering = this.props.orderBy.ordering;
    if (field == this.props.orderBy.field) {
      ordering = ordering * -1;
    }
    this.props.changeOptions({ orderBy: { field: field, ordering: ordering } });
  }
  handleOrderByIcon(column) {
    if (_.isUndefined(column.orderable)) {
      return;
    }
    let color = "#bbb";
    let iconClass = "sort";
    if (column.data == this.props.orderBy.field) {
      color = "#222";
      if (this.props.orderBy.ordering == -1) {
        iconClass = "sort descending";
      } else {
        iconClass = "sort ascending";
      }
    }
    const setOrder = () => {
      this.handleOrderBy(column.data);
    };
    return (
      <Icon
        name={iconClass}
        onClick={setOrder}
        style={{ cursor: "pointer", color }}
      />
    );
  }

  _renderColumn = (column, obj) => {
    if (column.component) {
      return <column.component doc={obj} {...column.props} />;
    } else if (column.render) {
      return column.render(obj);
    } else {
      return <span>{this.getFieldName(obj, column.data)}</span>;
    }
  };

  _renderFilters = () => {
    const { activeFilters, filters } = this.props;
    return (
      <div style={{ overflow: "auto" }}>
        {filters.map((group, i) => {
          return (
            <div
              style={{ float: "left", margin: "5px 20px 5px 0" }}
              key={`group-${i}`}
            >
              {group.title ? (
                <Label size="tiny" style={{ marginRight: 5 }}>
                  {group.title}
                </Label>
              ) : null}
              <Button.Group basic compact size="mini">
                {group.items.map(filter => {
                  const active = !_.isUndefined(
                    _.findWhere(activeFilters, { name: filter.name })
                  );
                  return (
                    <Button
                      toggle
                      icon={group.icon}
                      active={active ? true : false}
                      key={filter.name}
                      onClick={() => {
                        this.props.toggleFilter(filter);
                      }}
                    >
                      {filter.render
                        ? filter.render(filter, active)
                        : filter.name}
                    </Button>
                  );
                })}
              </Button.Group>
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    // const { loading, hasMore, posts, loadingMore, count } = this.props;
    const {
      columns,
      title,
      data,
      loading,
      search,
      changeOptions,
      actions,
      hasMore,
      loadingMore,
      count,
      countReady,
      hideHeader,
      filters,
      activeFilters
    } = this.props;
    // console.log("render table data", {
    //   columns,
    //   title,
    //   data,
    //   loading,
    //   search,
    //   changeOptions,
    //   actions,
    //   hasMore,
    //   loadingMore,
    //   count,
    //   countReady,
    //   hideHeader,
    //   filters,
    //   activeFilters
    // });
    // console.log("render TableData");
    return (
      <div>
        {loading ? (
          <LoadingBlock key="loading" />
        ) : (
          <div>
            {!hideHeader ? (
              <div>
                <Menu pointing secondary stackable>
                  <Menu.Item header>
                    {title}{" "}
                    <Label size="mini" circular>
                      {count}
                    </Label>
                  </Menu.Item>

                  <Menu.Menu position="right">
                    {filters.length ? (
                      <Menu.Item>{this._renderFilters()}</Menu.Item>
                    ) : null}
                    <Menu.Item>
                      <SearchBox
                        autoFocus={true}
                        search={changeOptions}
                        value={search}
                      />
                    </Menu.Item>
                  </Menu.Menu>
                </Menu>
              </div>
            ) : (
              ""
            )}
            <div style={{ overflow: "auto" }}>
              <Table>
                <Table.Header>
                  <Table.Row>
                    {columns.map((column, index) => (
                      <Table.HeaderCell key={`hColumn-${index}`}>
                        {column.label} {this.handleOrderByIcon(column)}
                      </Table.HeaderCell>
                    ))}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.map((obj, index) => (
                    <Table.Row key={`row-${index}`}>
                      {columns.map((column, index) => (
                        <Table.Cell key={`column-${index}`}>
                          {this._renderColumn(column, obj)}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))}
                </Table.Body>
                {hasMore ? (
                  <Table.Footer>
                    <Table.Row>
                      <Table.HeaderCell
                        colSpan={columns.length}
                        textAlign="center"
                      >
                        <Button
                          onClick={this.loadMore}
                          loading={loadingMore ? true : false}
                        >
                          Load More
                        </Button>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Footer>
                ) : null}
              </Table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

TableData.propTypes = {
  publication: Proptypes.string,
  collection: Proptypes.object,
  selector: Proptypes.object,
  columns: Proptypes.array,
  limit: Proptypes.number,
  orderBy: Proptypes.object,
  changeOptions: Proptypes.func,
  showLoadMore: Proptypes.bool
};
