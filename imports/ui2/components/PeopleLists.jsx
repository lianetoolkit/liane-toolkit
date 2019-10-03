import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import styled from "styled-components";
import moment from "moment";

import { alertStore } from "../containers/Alerts.jsx";

import Loading from "./Loading.jsx";
import Table from "./Table.jsx";
import Button from "./Button.jsx";

const messages = defineMessages({
  confirm: {
    id: "app.people.lists.confirm_remove",
    defaultMessage:
      "Are you sure you'd like to remove all people from this import?"
  }
});

const Container = styled.div`
  margin: -2rem;
  overflow: hidden;
  border-radius: 0 0 7px 7px;
  position: relative;
  .tip {
    font-size: 0.8em;
    color: #666;
    margin: 1rem 2rem;
  }
  .not-found {
    margin: 2rem;
    text-align: center;
    font-size: 1.2em;
    color: #999;
    font-style: italic;
  }
  .button {
    font-size: 0.8em;
    text-align: center;
  }
`;

class PeopleLists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      counts: {}
    };
  }
  componentDidMount() {
    this.fetchCounts();
  }
  fetchCounts = () => {
    const { lists } = this.props;
    lists.forEach(list => {
      this.setState({ loading: true });
      Meteor.call(
        "peopleLists.peopleCount",
        { listId: list._id },
        (err, res) => {
          this.setState({ loading: false });
          if (!err) {
            this.setState({
              counts: {
                ...this.state.counts,
                [list._id]: res
              }
            });
          }
        }
      );
    });
  };
  _handleRemoveClick = listId => ev => {
    const { intl } = this.props;
    ev.preventDefault();
    if (confirm(intl.formatMessage(messages.confirm))) {
      this.setState({ loading: true });
      Meteor.call("peopleLists.remove", { listId }, (err, res) => {
        this.setState({ loading: false });
        if (err) {
          alertStore.add(err);
        } else {
          window.location.reload();
        }
      });
    }
  };
  render() {
    const { lists } = this.props;
    const { loading, counts } = this.state;
    return (
      <Container>
        {loading ? <Loading full /> : null}
        {lists && lists.length ? (
          <>
            <Table compact>
              <thead>
                <tr>
                  <th>
                    <FormattedMessage
                      id="app.people.lists.table_header.name"
                      defaultMessage="Name"
                    />
                  </th>
                  <th>
                    <FormattedMessage
                      id="app.people.lists.table_header.date"
                      defaultMessage="Date"
                    />
                  </th>
                  <th>
                    <FormattedMessage
                      id="app.people.lists.table_header.people"
                      defaultMessage="People"
                    />
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lists.map(list => (
                  <tr key={list._id}>
                    <td
                      className="fill"
                      style={{ width: "100%", wordBreak: "break-all" }}
                    >
                      {list.name}
                    </td>
                    <td>{moment(list.createdAt).format("L")}</td>
                    <td>
                      <FormattedMessage
                        id="app.people.lists.table_body.people"
                        defaultMessage="{count} imported people"
                        values={{ count: counts[list._id] }}
                      />
                    </td>
                    <td>
                      <a
                        href="javascript:void(0);"
                        className="button delete"
                        onClick={this._handleRemoveClick(list._id)}
                      >
                        <FormattedMessage
                          id="app.people.lists.table_body.remove"
                          defaultMessage="Remove"
                        />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <p className="tip">
              <FormattedMessage
                id="app.people.lists.table_body.remove_warning"
                defaultMessage="By removing a list, youl'll remove all people imported from it."
              />
            </p>
          </>
        ) : (
          <p className="not-found">
            <FormattedMessage
              id="app.people.lists.table_body.not_found"
              defaultMessage="No import found"
            />
          </p>
        )}
      </Container>
    );
  }
}

PeopleLists.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(PeopleLists);
