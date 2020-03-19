import React, { Component } from "react";
import { Accounts } from "meteor/accounts-base";
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
  max-width: 600px;
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
    margin: 0 0 1rem;
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
  .button-group {
    margin-bottom: 1rem;
  }
`;

class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }
  _handleSubmit = ev => {
    ev.preventDefault();
    const { formData } = this.state;
    if (!formData.newPassword) {
      alertStore.add("You must set a password", "error");
      return;
    }
    if (formData.newPassword != formData.newPasswordRpt) {
      alertStore.add("Passwords do not match", "error");
      return;
    }
    Accounts.changePassword(formData.oldPassword, formData.newPassword, err => {
      if (err) {
        console.log(err);
        alertStore.add(err);
      } else {
        alertStore.add(null, "success");
      }
    });
  };
  _handleChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value
      }
    });
  };
  render() {
    return (
      <Form onSubmit={this._handleSubmit}>
        <input
          type="password"
          name="oldPassword"
          placeholder="Old password"
          onChange={this._handleChange}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New password"
          onChange={this._handleChange}
        />
        <input
          type="password"
          name="newPasswordRpt"
          placeholder="Repeat new password"
          onChange={this._handleChange}
        />
        <input type="submit" value="Update password" />
      </Form>
    );
  }
}

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
  _handleChangePasswordClick = ev => {
    ev.preventDefault();
    modalStore.set(<ChangePassword />);
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
        <Button.Group>
          <Button>Update profile</Button>
          <Button>Change email</Button>
          <Button onClick={this._handleChangePasswordClick}>
            Change password
          </Button>
        </Button.Group>
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
