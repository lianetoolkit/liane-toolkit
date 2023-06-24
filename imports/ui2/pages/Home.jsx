import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

import Page from "../components/Page.jsx";
import Button from "../components/Button.jsx";
import Loading from "../components/Loading.jsx";
import OrLine from "../components/OrLine.jsx";
import Form from "../components/Form.jsx";
import CountrySelect from "../components/CountrySelect.jsx";
import FacebookButton from "../components/FacebookButton.jsx";
import PrivacyAgreementField from "../components/PrivacyAgreementField.jsx";

import ForgotPassword from "../components/ForgotPassword.jsx";

const Container = styled.div`
  flex: 1 1 100%;
  .support-text {
    color: #999;
    padding: 0 2rem 2rem;
    margin: 0;
    text-align: center;
    font-size: 0.8em;
    border-bottom: 1px solid #eee;
  }
  hr {
    margin-bottom: 0;
  }
`;

const HighlightContainer = styled.div`
  padding: 6rem 0 8rem;
  position: relative;
  border-bottom: 1px solid #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url("/images/highlight_pattern.jpg");
  background-position: top right;
  background-size: cover;
  color: #fff;
  h2 {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0;
    text-transform: uppercase;
    flex-direction: column;
    line-height: 1.3;
    color: #fff;
  }
`;

const Content = styled.div`
  margin: 0 auto 4rem;
  ${(props) =>
    props.centered &&
    css`
      max-width: 1000px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    `}
`;

const LoginFormContainer = styled.form`
  margin: -1.7rem auto 4rem;
  text-align: center;
  position: relative;
  z-index: 2;
  ${(props) =>
    props.floated &&
    css`
      margin: 4rem 2rem 4rem;
      max-width: 350px;
    `}
  p,
  h3 {
    margin: 0 0 2rem;
  }
  .facebook-button {
    display: inline-block;
    margin: 0 auto 0;
    max-width: 300px;
    font-size: 0.9em;
  }
  .terms {
    margin-top: 1rem;
    font-size: 0.8em;
    color: #999;
    text-align: center;
  }
  .password-login {
    form {
      max-width: 300px;
      margin: 2rem auto 0;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
      border-radius: 7px;
      input {
        display: block;
        width: 100%;
        margin: 0;
        border-radius: 0;
      }
      input:first-child {
        border-radius: 7px 7px 0 0;
        border-bottom: 0;
      }
      input:last-child {
        border-top: 0;
        border-radius: 0 0 7px 7px;
      }
    }
    nav {
      max-width: 300px;
      margin: 1rem auto 0;
      display: flex;
      a {
        flex: 1 1 auto;
        text-align: center;
        color: #777;
        font-size: 0.8em;
        text-decoration: none;
        &:hover,
        &:active,
        &:focus {
          color: #000;
        }
      }
    }
  }
`;

const UserContainer = styled.div`
  max-width: 400px;
  margin: -3rem auto 4rem;
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
  padding: 2rem;
  z-index: 4;
  position: relative;
  h3 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 2rem;
  }
  .button.primary {
    margin: 0 0 2rem;
    display: block;
  }
  p {
    font-size: 0.9em;
    color: #666;
  }
  .button-group {
    margin-top: 2rem;
  }
`;

const ClosedContainer = styled.div`
  max-width: 400px;
  box-sizing: border-box;
  margin: -4rem 0 0;
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
  padding: 2rem;
  z-index: 4;
  position: relative;
  h3 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 2rem;
    font-weight: 600;
  }
  .button.primary {
    margin: 0 0 2rem;
    display: block;
  }
  p {
    font-size: 0.9em;
  }
  .button-group {
    margin-top: 2rem;
  }
  p.privacy-text {
    font-size: 0.8em;
    color: #777;
  }
  form {
    font-size: 0.9em;
    > label {
      margin: 0 0 0.5rem;
    }
    .privacy-consent {
      margin: 0.5rem 0 1rem;
      border: 0;
      label {
        padding: 0rem 0.5rem 0rem 0rem;
      }
      > span {
        font-size: 0.9em;
        padding: 0;
      }
    }
  }
`;

const messages = defineMessages({
  emailPlaceholder: {
    id: "app.auth.email_placeholder",
    defaultMessage: "Email",
  },
  passwordPlaceholder: {
    id: "app.auth.password_placeholder",
    defaultMessage: "Password",
  },
  loginLabel: {
    id: "app.auth.login_label",
    defaultMessage: "Login",
  },
  forgotPasswordTitle: {
    id: "app.auth.forgot_password_title",
    defaultMessage: "Forgot my password",
  },
  subscriptionValidation: {
    id: "app.subscription_validation",
    defaultMessage:
      "You must provide an email and agree with the privacy policy and terms of use",
  },
});

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      agreed: false,
      loading: false,
      subscribeFormData: { name: "", email: "" },
      subscribed: false,
      loginFormData: {},
    };
  }
  componentDidMount() {
    this._verifyClosed();
  }
  _verifyClosed = () => {
    this.setState({ loading: true });
    Meteor.call("users.isAppPrivate", {}, (err, res) => {
      this.setState({ loading: false });
      this.setState({
        isClosed: res.isPrivate,
        hasMail: res.hasMail,
      });
    });
  };
  _handleSubscribeChange = ({ target }) => {
    this.setState({
      subscribeFormData: {
        ...this.state.subscribeFormData,
        [target.name]: target.value,
      },
    });
  };
  _handleSubscribeSubmit = (ev) => {
    ev.preventDefault();
    const { intl } = this.props;
    const { subscribeFormData, agreed } = this.state;
    if (agreed && subscribeFormData.email) {
      Meteor.call(
        "users.mailSubscribe",
        this.state.subscribeFormData,
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            this.setState({ subscribed: true });
          }
        }
      );
    } else {
      alertStore.add(
        intl.formatMessage(messages.subscriptionValidation),
        "error"
      );
    }
  };
  _handlePasswordLoginSubmit = (ev) => {
    ev.preventDefault();
    const { loginFormData } = this.state;
    if (loginFormData.email && loginFormData.password) {
      Meteor.loginWithPassword(
        loginFormData.email,
        loginFormData.password,
        (err) => {
          if (err) {
            alertStore.add(err);
          }
        }
      );
    }
  };
  _handlePasswordLoginChange = ({ target }) => {
    this.setState({
      loginFormData: {
        ...this.state.loginFormData,
        [target.name]: target.value,
      },
    });
  };
  _handleForgotPwdClick = (ev) => {
    ev.preventDefault();
    const { intl } = this.props;
    modalStore.setType("small");
    modalStore.setTitle(intl.formatMessage(messages.forgotPasswordTitle));
    modalStore.set(<ForgotPassword />);
  };
  _showForm = () => {
    const { isLoggedIn, invite } = this.props;
    const { isClosed, hasMail } = this.state;
    const user = Meteor.user();
    return isClosed && hasMail && !user && !invite;
  };
  render() {
    const { intl, isLoggedIn, invite } = this.props;
    const { loading, isClosed, hasMail, subscribed } = this.state;
    const user = Meteor.user();
    return (
      <>
        {loading ? <Loading full /> : null}
        <Container>
          <HighlightContainer>
            <h2>
              <FormattedMessage
                id="app.slogan"
                defaultMessage="Technology for Political Innovation"
              />
            </h2>
          </HighlightContainer>
          <Content centered={this._showForm()}>
            {this._showForm() ? (
              <ClosedContainer>
                {!subscribed ? (
                  <>
                    <h3>
                      <FormattedMessage
                        id="app.mail_subscription.form_title"
                        defaultMessage="Liane is currently a product under testing for a limited number of users."
                      />
                    </h3>
                    <p>
                      <FormattedMessage
                        id="app.mail_subscription.form_text"
                        defaultMessage="Please complete this form to request an invitation."
                      />
                    </p>
                    <Form onSubmit={this._handleSubscribeSubmit}>
                      <Form.Field>
                        <input
                          type="text"
                          placeholder="Name"
                          name="name"
                          onChange={this._handleSubscribeChange}
                        />
                      </Form.Field>
                      <Form.Field>
                        <input
                          type="email"
                          placeholder="Email"
                          name="email"
                          onChange={this._handleSubscribeChange}
                        />
                      </Form.Field>
                      <Form.Field>
                        <CountrySelect
                          name="country"
                          onChange={this._handleSubscribeChange}
                        />
                      </Form.Field>
                      <PrivacyAgreementField
                        onChange={(checked) => {
                          this.setState({ agreed: !!checked });
                        }}
                      />
                      <input type="submit" value="Submit" />
                    </Form>
                  </>
                ) : (
                  <p className="success">
                    <FormattedMessage
                      id="app.mail_subscription.thanks"
                      defaultMessage="Thank you for subscribing!"
                    />
                  </p>
                )}
              </ClosedContainer>
            ) : null}
            {!isLoggedIn || !user ? (
              <LoginFormContainer floated={this._showForm()}>
                <FacebookButton type={invite ? "campaigner" : false} />
                <p className="terms">
                  <FormattedHTMLMessage
                    id="app.terms_and_policy"
                    defaultMessage="By registering in LIANE you agree with our <a href='https://files.liane.cc/legal/terms_of_use_v1_pt-br.pdf' target='_blank' rel='external'>terms of use</a> and <a href='https://files.liane.cc/legal/privacy_policy_v1_pt-br.pdf' target='_blank' rel='external' >privacy policy</a>."
                  />
                </p>
                <div className="password-login">
                  <OrLine bgColor="#f7f7f7">
                    <FormattedMessage
                      id="app.auth.or_email"
                      defaultMessage="Or with your email"
                    />
                  </OrLine>
                  <Form onSubmit={this._handlePasswordLoginSubmit}>
                    <div className="inputs">
                      <input
                        type="email"
                        name="email"
                        placeholder={intl.formatMessage(
                          messages.emailPlaceholder
                        )}
                        onChange={this._handlePasswordLoginChange}
                      />
                      <input
                        type="password"
                        name="password"
                        placeholder={intl.formatMessage(
                          messages.passwordPlaceholder
                        )}
                        onChange={this._handlePasswordLoginChange}
                      />
                      <input
                        type="submit"
                        value={intl.formatMessage(messages.loginLabel)}
                      />
                    </div>
                  </Form>
                  <nav>
                    <a href={FlowRouter.path("App.register")}>
                      <FormattedMessage
                        id="app.auth.register_link_label"
                        defaultMessage="Register new account"
                      />
                    </a>
                    <a
                      href="javascript:void(0);"
                      onClick={this._handleForgotPwdClick}
                    >
                      <FormattedMessage
                        id="app.auth.forgot_pwd_label"
                        defaultMessage="Forgot my password"
                      />
                    </a>
                  </nav>
                </div>
              </LoginFormContainer>
            ) : (
              <UserContainer>
                <h3>
                  <FormattedMessage
                    id="app.connected_as"
                    defaultMessage="Connected as"
                  />{" "}
                  <strong>{user.name}</strong>
                </h3>
                {!user.type ? (
                  <p>
                    <FormattedMessage
                      id="app.waiting_user_type"
                      defaultMessage="Waiting selection of user type."
                    />
                  </p>
                ) : (
                  <div>
                    {user.type == "campaigner" ? (
                      <>
                        <Button
                          primary
                          href="https://docs.google.com/forms/d/1fegH_ESk3HcoMlf-RVJt3oFoSE_icIjxH05_tF_8wuU/edit?ts=64936ccd"
                        >
                          <FormattedMessage
                            id="app.create_campaign"
                            defaultMessage="Create new campaign"
                          />
                        </Button>
                        <OrLine />
                      </>
                    ) : null}
                    <p>
                      <FormattedMessage
                        id="app.connect_campaign"
                        defaultMessage="Connect with an existing campaign by forwarding your email to the person responsible"
                      />
                      :
                    </p>
                    <input
                      type="text"
                      disabled
                      value={user.emails[0].address}
                    />
                    <Button.Group>
                      <Button href={FlowRouter.path("App.account")}>
                        <FormattedMessage
                          id="app.my_account"
                          defaultMessage="My account"
                        />
                      </Button>
                      <Button
                        onClick={() => {
                          Meteor.logout();
                        }}
                      >
                        <FormattedMessage
                          id="app.logout"
                          defaultMessage="Logout"
                        />
                      </Button>
                    </Button.Group>
                  </div>
                )}
              </UserContainer>
            )}
          </Content>
        </Container>
      </>
    );
  }
}

Home.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Home);
