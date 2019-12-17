import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage
} from "react-intl";
import styled from "styled-components";

import OrLine from "../components/OrLine.jsx";
import Form from "../components/Form.jsx";
import Button from "../components/Button.jsx";
import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

const messages = defineMessages({
  deleteLabel: {
    id: "app.my_account.delete_label",
    defaultMessage: "Delete permanently"
  },
  emailLabel: {
    id: "app.my_account.delete_email_label",
    defaultMessage: "Type your email to confirm deletion:"
  },
  campaigner: {
    id: "app.my_account.campaigner_label",
    defaultMessage: "Campaigner"
  },
  collaborator: {
    id: "app.my_account.collaborator_label",
    defaultMessage: "Collaborator"
  },
  unknown: {
    id: "app.my_account.unknown_label",
    defaultMessage: "Unknown"
  }
});

const Container = styled.div`
  max-width: 500px;
  margin: 4rem auto;
  padding: 2rem;
  border-radius: 7px;
  border: 1px solid #ddd;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: auto;
  .info {
    flex: 1 1 100%;
    margin: 0 0 3rem;
  }
  h2 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 0.5rem;
  }
  .account-type {
    color: #666;
    margin: 0 0 3rem;
  }
  .button {
    display: block;
    margin: 0;
  }
  .button.delete {
    border-radius: 7px;
  }
`;

class ConfirmRemove extends Component {
  constructor(props) {
    super(props);
    this.state = { typedEmail: "", valid: false };
  }
  componentDidUpdate(prevProps, prevState) {
    const user = Meteor.user();
    const { typedEmail } = this.state;
    if (prevState.typedEmail != typedEmail) {
      this.setState({
        valid: typedEmail == user.emails[0].address
      });
    }
  }
  _handleSubmit = ev => {
    ev.preventDefault();
    const { onConfirm } = this.props;
    if (this.state.valid) {
      onConfirm && onConfirm();
    }
  };
  render() {
    const { intl } = this.props;
    const { valid } = this.state;
    return (
      <div>
        <p>
          <FormattedMessage
            id="app.my_account.delete_message"
            defaultMessage="Delete account, campaign and all data associated to this platform, as well as revoke previously granted Facebook permissions"
          />
        </p>
        <Form.Field label={intl.formatMessage(messages.emailLabel)}>
          <input
            type="text"
            onChange={({ target }) => {
              this.setState({ typedEmail: target.value });
            }}
          />
        </Form.Field>
        <input
          disabled={!valid}
          className="button delete"
          type="submit"
          value={intl.formatMessage(messages.deleteLabel)}
          onClick={this._handleSubmit}
        />
      </div>
    );
  }
}

ConfirmRemove.propTypes = {
  intl: intlShape.isRequired
};

const ConfirmRemoveIntl = injectIntl(ConfirmRemove);

class MyAccount extends Component {
  _handleRemoveClick = () => {
    modalStore.setType("small");
    modalStore.set(<ConfirmRemoveIntl onConfirm={this._handleRemove} />);
  };
  _handleRemove = () => {
    Meteor.call("users.removeSelf", {}, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        window.location.reload();
      }
    });
  };
  _getAccountTypeLabel = () => {
    const { intl } = this.props;
    const user = Meteor.user();
    switch (user.type) {
      case "campaigner":
        return intl.formatMessage(messages.campaigner);
      case "user":
        return intl.formatMessage(messages.collaborator);
      default:
        return intl.formatMessage(messages.unknown);
    }
  };
  render() {
    const user = Meteor.user();
    return (
      <Container>
        <div className="info">
          <h2>
            <FormattedHTMLMessage
              id="app.my_account.connected_as"
              defaultMessage="Connected as <strong>{name}</strong>"
              values={{ name: user.name }}
            />
          </h2>
          <p className="account-type">
            <FormattedHTMLMessage
              id="app.my_account.account_type"
              defaultMessage="Account type: <strong>{type}</strong>"
              values={{ type: this._getAccountTypeLabel() }}
            />
          </p>
          <Button primary href={FlowRouter.path("App.campaign.new")}>
            <FormattedMessage
              id="app.my_account.create_campaign"
              defaultMessage="Create a campaign"
            />
          </Button>
          <OrLine />
          <p>
            <FormattedMessage
              id="app.my_account.connect"
              defaultMessage="Connect with an existing campaign by forwarding your email to the person responsible:"
            />
          </p>
          <input type="text" disabled value={user.emails[0].address} />
        </div>
        <a
          href="javascript:void(0);"
          className="button delete"
          onClick={this._handleRemoveClick}
        >
          <FormattedMessage
            id="app.my_account.delete_button_label"
            defaultMessage="Click here to delete your account, campaign and all data associated to this platform, as well as revoke previously granted Facebook permissions."
          />
        </a>
      </Container>
    );
  }
}

MyAccount.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(MyAccount);
