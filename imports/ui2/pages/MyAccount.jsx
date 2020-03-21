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
import CountrySelect from "../components/CountrySelect.jsx";
import RegionSelect from "../components/RegionSelect.jsx";
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
        modalStore.reset(true);
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
        <Form.Field label="Old password">
          <input
            type="password"
            name="oldPassword"
            onChange={this._handleChange}
          />
        </Form.Field>
        <Form.Field label="New password">
          <input
            type="password"
            name="newPassword"
            onChange={this._handleChange}
          />
        </Form.Field>
        <Form.Field label="Repeat new password">
          <input
            type="password"
            name="newPasswordRpt"
            onChange={this._handleChange}
          />
        </Form.Field>
        <input type="submit" value="Update password" />
      </Form>
    );
  }
}

class UpdateProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }
  componentDidMount() {
    const user = Meteor.user();
    this.setState({
      formData: {
        name: user.name,
        country: user.country,
        region: user.region
      }
    });
  }
  _handleSubmit = ev => {
    ev.preventDefault();
    const { formData } = this.state;
    Meteor.call(
      "users.updateProfile",
      {
        name: formData.name,
        country: formData.country,
        region: formData.region
      },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add(null, "success");
          modalStore.reset(true);
        }
      }
    );
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
    const { formData } = this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Field label="Name">
          <input
            type="text"
            name="name"
            onChange={this._handleChange}
            value={formData.name}
          />
        </Form.Field>
        <Form.Field label="Country">
          <CountrySelect
            name="country"
            onChange={this._handleChange}
            value={formData.country}
          />
        </Form.Field>
        {formData.country ? (
          <Form.Field label="Region">
            <RegionSelect
              country={formData.country}
              name="region"
              onChange={this._handleChange}
              value={formData.region}
            />
          </Form.Field>
        ) : null}
        <input type="submit" value="Update profile" />
      </Form>
    );
  }
}

class UpdateEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }
  _handleChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value
      }
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { formData } = this.state;
    if (formData.email) {
      Meteor.call(
        "users.updateEmail",
        { email: formData.email },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add(null, "success");
            modalStore.reset(true);
          }
        }
      );
    }
  };
  render() {
    return (
      <Form onSubmit={this._handleSubmit}>
        <p>You will need to verify your new email address.</p>
        <Form.Field label="New email address">
          <input type="email" name="email" onChange={this._handleChange} />
        </Form.Field>
        <input type="submit" value="Update email" />
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
    modalStore.setType("small");
    modalStore.setTitle("Change password");
    modalStore.set(<ChangePassword />);
  };
  _handleUpdateProfileClick = ev => {
    ev.preventDefault();
    modalStore.setType("small");
    modalStore.setTitle("Update profile");
    modalStore.set(<UpdateProfile />);
  };
  _handleUpdateEmailClick = ev => {
    ev.preventDefault();
    modalStore.setType("small");
    modalStore.setTitle("Update email");
    modalStore.set(<UpdateEmail />);
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
          <Button onClick={this._handleUpdateProfileClick}>
            Update profile
          </Button>
          <Button onClick={this._handleUpdateEmailClick}>Change email</Button>
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
