import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import styled from "styled-components";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import { Table, Button, Icon, Header } from "semantic-ui-react";

export default class PeopleManageImports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      counts: {},
      loading: false
    };
  }
  _fetchCounts(lists) {
    if (!lists || !lists.length) return;
    for (let list of lists) {
      Meteor.call(
        "peopleLists.peopleCount",
        { listId: list._id },
        (err, res) => {
          if (!err && res) {
            this.setState({
              counts: {
                ...this.state.counts,
                [list._id]: res
              }
            });
          }
        }
      );
    }
  }
  _handleRemoveClick = listId => ev => {
    ev.preventDefault();
    this.context.confirmStore.show({
      text: "Are you sure? This will remove ALL PEOPLE from this import.",
      callback: () => {
        this.setState({
          loading: true
        });
        Meteor.call("peopleLists.remove", { listId }, (err, res) => {
          this.setState({ loading: false });
          if (err) {
            Alerts.error(err);
          } else {
            Alerts.success("List and all its people removed successfully");
          }
          this.context.confirmStore.hide();
          setTimeout(() => {
            location.reload();
          }, 1000);
        });
      }
    });
  };
  componentDidMount() {
    const { lists } = this.props;
    if (lists && lists.length) {
      this._fetchCounts(lists);
    }
  }
  componentWillReceiveProps(nextProps) {
    const { lists } = this.props;
    if (
      nextProps.lists &&
      JSON.stringify(nextProps.lists) != JSON.stringify(lists)
    ) {
      this._fetchCounts(nextProps.lists);
    }
  }
  render() {
    const { lists } = this.props;
    const { counts } = this.state;
    return (
      <div>
        {lists && lists.length ? (
          <Table celled>
            <Table.Body>
              {lists.map(list => (
                <Table.Row key={list._id}>
                  <Table.Cell>
                    <strong>{list.name}</strong>
                  </Table.Cell>
                  <Table.Cell>
                    {moment(list.createdAt).format("LLL")}
                  </Table.Cell>
                  <Table.Cell>
                    {counts[list._id] ? (
                      <span>{counts[list._id]} people imported</span>
                    ) : null}
                  </Table.Cell>
                  <Table.Cell collapsing>
                    <Button.Group size="mini">
                      <Button
                        negative
                        onClick={this._handleRemoveClick(list._id)}
                      >
                        <Icon name="trash" /> Remove
                      </Button>
                    </Button.Group>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <p>No import was found</p>
        )}
      </div>
    );
  }
}

PeopleManageImports.contextTypes = {
  confirmStore: PropTypes.object
};
