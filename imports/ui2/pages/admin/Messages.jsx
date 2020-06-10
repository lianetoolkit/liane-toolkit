import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";
import moment from "moment";

import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { modalStore } from "/imports/ui2/containers/Modal.jsx";

import Table from "/imports/ui2/components/Table.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

const messages = defineMessages({});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
`;

const TableContainer = styled.div`
  flex: 1 1 100%;
  overflow-x: hidden;
  overflow-y: auto;
  transition: opacity 0.1s linear;
`;

class UsersPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCount: false,
      count: 0,
    };
  }
  componentDidUpdate(prevProps) {}
  componentDidMount() {
    this.setState({ loadingCount: true });
    Meteor.call("messages.queryCount", { query: {} }, (err, res) => {
      this.setState({ loadingCount: false, count: res });
    });
  }
  _handleNext = () => {
    const { page, limit } = this.props;
    const { count } = this.state;
    if ((page - 1) * limit + limit < count) {
      FlowRouter.setQueryParams({ page: page + 1 });
    }
  };
  _handlePrev = () => {
    const { page } = this.props;
    if (page > 1) {
      FlowRouter.setQueryParams({ page: page - 1 });
    }
  };
  render() {
    const { intl, messages, page, limit } = this.props;
    const { loadingCount, count } = this.state;
    return (
      <Container>
        <PagePaging
          skip={page - 1}
          limit={limit}
          count={count}
          loading={loadingCount}
          onNext={this._handleNext}
          onPrev={this._handlePrev}
        >
          <Button primary href={FlowRouter.path("/admin/messages/new")}>
            <FormattedMessage
              id="app.admin.messages.new_message"
              defaultMessage="New message"
            />
          </Button>
        </PagePaging>
        <TableContainer>
          <Table compact>
            <thead>
              <tr>
                <th className="fill">
                  <FormattedMessage
                    id="app.admin.messages.title"
                    defaultMessage="Title"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.messages.recipientCount"
                    defaultMessage="Recipient count"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.messages.target"
                    defaultMessage="Message target"
                  />
                </th>
                <th />
                <th>
                  <FormattedMessage
                    id="app.admin.messages.created_label"
                    defaultMessage="Created"
                  />
                </th>
              </tr>
            </thead>
            {messages.map((message) => (
              <tbody key={message._id}>
                <tr>
                  <td className="fill">{message.title}</td>
                  <td>{message.recipientCount}</td>
                  <td>{message.type}</td>
                  <td>
                    <Button
                      className="button small"
                      href={FlowRouter.path(`/messages/${message._id}`)}
                    >
                      <FormattedMessage
                        id="app.admin.messages.view_message"
                        defaultMessage="View message"
                      />
                    </Button>
                  </td>
                  <td className="small">
                    {moment(message.createdAt).format("L")}
                  </td>
                </tr>
              </tbody>
            ))}
          </Table>
        </TableContainer>
      </Container>
    );
  }
}

UsersPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(UsersPage);
