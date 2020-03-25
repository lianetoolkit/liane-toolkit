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
import Loading from "../components/Loading.jsx";
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
  },
  updateProfileTitle: {
    id: "app.my_account.update_profile.title",
    defaultMessage: "Update profile"
  },
  nameLabel: {
    id: "app.my_account.update_profile.name_label",
    defaultMessage: "Name"
  },
  countryLabel: {
    id: "app.my_account.update_profile.country_label",
    defaultMessage: "Country"
  },
  regionLabel: {
    id: "app.my_account.update_profile.region_label",
    defaultMessage: "Region"
  },
  updateProfileSubmitLabel: {
    id: "app.my_account.update_profile.submit_label",
    defaultMessage: "Update profile"
  },
  updateEmailTitle: {
    id: "app.my_account.update_email.title",
    defaultMessage: "Update email"
  },
  newEmailLabel: {
    id: "app.my_account.update_email.new_email_label",
    defaultMessage: "New email address"
  },
  updateEmailSubmitLabel: {
    id: "app.my_account.update_email.submit_label",
    defaultMessage: "Update email"
  },
  changePasswordTitle: {
    id: "app.my_account.change_password.title",
    defaultMessage: "Change password"
  },
  oldPasswordLabel: {
    id: "app.my_account.change_password.old_password_label",
    defaultMessage: "Old password"
  },
  newPasswordLabel: {
    id: "app.my_account.change_password.new_password_label",
    defaultMessage: "New password"
  },
  newPasswordRptLabel: {
    id: "app.my_account.change_password.new_password_rpt_label",
    defaultMessage: "Repeat new password"
  },
  pwdDoNotMatch: {
    id: "app.my_account.change_password.not_match",
    defaultMessage: "Passwords do not match"
  },
  changePasswordSubmitLabel: {
    id: "app.my_account.change_password.submit_label",
    defaultMessage: "Update password"
  }
});

const ChangePwdContainer = styled.div`
  .reset-pwd {
    color: #666;
    font-size: 0.8em;
    background: #f7f7f7;
    padding: 1.5rem 3rem;
    margin: -2rem -3rem 2rem -3rem;
    .button {
      margin: 0;
      display: block;
    }
  }
`;

class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {}
    };
  }
  _handleSubmit = ev => {
    ev.preventDefault();
    const { intl } = this.props;
    const { formData } = this.state;
    if (!formData.newPassword) {
      return;
    }
    if (formData.newPassword != formData.newPasswordRpt) {
      alertStore.add(intl.formatMessage(messages.pwdDoNotMatch), "error");
      return;
    }
    this.setState({ loading: true });
    Accounts.changePassword(formData.oldPassword, formData.newPassword, err => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add(null, "success");
        modalStore.reset(true);
      }
      this.setState({ loading: false });
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
  _handlePwdResetClick = ev => {
    ev.preventDefault();
    const user = Meteor.user();
    this.setState({ loading: true });
    Accounts.forgotPassword({ email: user.emails[0].address }, err => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add(null, "success");
        modalStore.reset(true);
      }
      this.setState({ loading: false });
    });
  };
  render() {
    const { intl } = this.props;
    const { loading } = this.state;
    if (loading) return <Loading />;
    return (
      <ChangePwdContainer>
        <Form onSubmit={this._handleSubmit}>
          <div className="reset-pwd">
            <p>
              <FormattedMessage
                id="app.my_account.reset_password.text"
                defaultMessage="If you haven't set or can't remember your current password:"
              />
            </p>
            <Button onClick={this._handlePwdResetClick}>
              <FormattedMessage
                id="app.my_account.reset_password.label"
                defaultMessage="Reset password"
              />
            </Button>
          </div>
          <Form.Field label={intl.formatMessage(messages.oldPasswordLabel)}>
            <input
              type="password"
              name="oldPassword"
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field label={intl.formatMessage(messages.newPasswordLabel)}>
            <input
              type="password"
              name="newPassword"
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field label={intl.formatMessage(messages.newPasswordRptLabel)}>
            <input
              type="password"
              name="newPasswordRpt"
              onChange={this._handleChange}
            />
          </Form.Field>
          <input
            type="submit"
            value={intl.formatMessage(messages.changePasswordSubmitLabel)}
          />
        </Form>
      </ChangePwdContainer>
    );
  }
}

ChangePassword.propTypes = {
  intl: intlShape.isRequired
};

const ChangePasswordIntl = injectIntl(ChangePassword);

class UpdateProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
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
    this.setState({ loading: true });
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
        this.setState({ loading: false });
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
    const { intl } = this.props;
    const { loading, formData } = this.state;
    if (loading) return <Loading />;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Field label={intl.formatMessage(messages.nameLabel)}>
          <input
            type="text"
            name="name"
            onChange={this._handleChange}
            value={formData.name}
          />
        </Form.Field>
        <Form.Field label={intl.formatMessage(messages.countryLabel)}>
          <CountrySelect
            name="country"
            onChange={this._handleChange}
            value={formData.country}
          />
        </Form.Field>
        {formData.country ? (
          <Form.Field label={intl.formatMessage(messages.regionLabel)}>
            <RegionSelect
              country={formData.country}
              name="region"
              onChange={this._handleChange}
              value={formData.region}
            />
          </Form.Field>
        ) : null}
        <input
          type="submit"
          value={intl.formatMessage(messages.updateProfileSubmitLabel)}
        />
      </Form>
    );
  }
}

UpdateProfile.propTypes = {
  intl: intlShape.isRequired
};

const UpdateProfileIntl = injectIntl(UpdateProfile);

class UpdateEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
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
      this.setState({ loading: true });
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
          this.setState({ loading: false });
        }
      );
    }
  };
  render() {
    const { intl } = this.props;
    const { loading } = this.state;
    if (loading) return <Loading />;
    return (
      <Form onSubmit={this._handleSubmit}>
        <p>
          <FormattedMessage
            id="app.my_account.verify_email_text"
            defaultMessage="You will need to verify your new email address."
          />
        </p>
        <Form.Field label={intl.formatMessage(messages.newEmailLabel)}>
          <input type="email" name="email" onChange={this._handleChange} />
        </Form.Field>
        <input
          type="submit"
          value={intl.formatMessage(messages.updateEmailSubmitLabel)}
        />
      </Form>
    );
  }
}

UpdateEmail.propTypes = {
  intl: intlShape.isRequired
};

const UpdateEmailIntl = injectIntl(UpdateEmail);

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

const Container = styled.div`
  max-width: 700px;
  margin: 3rem auto 2rem;
  padding: 2rem;
  border-radius: 7px;
  border: 1px solid #ddd;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: auto;
  box-sizing: border-box;
  h2 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 0.5rem;
  }
  .info {
    flex: 1 1 100%;
    margin: 0 0 1rem;
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
    const { intl } = this.props;
    modalStore.setType("small");
    modalStore.setTitle(intl.formatMessage(messages.changePasswordTitle));
    modalStore.set(<ChangePasswordIntl />);
  };
  _handleUpdateProfileClick = ev => {
    ev.preventDefault();
    const { intl } = this.props;
    modalStore.setType("small");
    modalStore.setTitle(intl.formatMessage(messages.updateProfileTitle));
    modalStore.set(<UpdateProfileIntl />);
  };
  _handleUpdateEmailClick = ev => {
    ev.preventDefault();
    const { intl } = this.props;
    modalStore.setType("small");
    modalStore.setTitle(intl.formatMessage(messages.updateEmailTitle));
    modalStore.set(<UpdateEmailIntl />);
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
            <FormattedMessage
              id="app.my_account.update_profile_label"
              defaultMessage="Update profile"
            />
          </Button>
          <Button onClick={this._handleUpdateEmailClick}>
            <FormattedMessage
              id="app.my_account.change_email_label"
              defaultMessage="Change email"
            />
          </Button>
          <Button onClick={this._handleChangePasswordClick}>
            <FormattedMessage
              id="app.my_account.change_password_label"
              defaultMessage="Change password"
            />
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
