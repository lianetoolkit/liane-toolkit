import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage
} from "react-intl";
import styled from "styled-components";
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
    max-width: 960px;
    margin: 0 auto;
    padding: 0;
    text-transform: uppercase;
    flex-direction: column;
    line-height: 1.3;
    color: #fff;
  }
`;

const LoginFormContainer = styled.form`
  margin: -1.7rem auto 0;
  text-align: center;
  position: relative;
  z-index: 2;
  ${"" /* border-radius: 7px;
  max-width: calc(960px - 4rem);
  padding: 2rem;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1); */}
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
  margin: -3rem auto 6rem;
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
`;

const Intro = styled.section`
  max-width: 960px;
  margin: 6rem auto 6rem;
  padding: 0 2rem;
  .first {
    max-width: 750px;
    display: flex;
    align-items: center;
    .intro-text {
      flex: 1 1 100%;
      color: #333;
      line-height: 1.5;
      p:first-child {
        font-size: 1.4em;
        border-bottom: 2px solid #ddd;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
        font-weight: 600;
      }
    }
    .features {
      flex: 1 1.5 100%;
    }
  }
`;

const Features = styled.section`
  background: #111;
  color: #fff;
  margin: 0 0 2rem;
  padding: 4rem 0;
  div {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
  }
  h2 {
    flex: 1 1 auto;
    text-align: right;
    border-right: 2px solid #444;
    padding: 1rem 2rem 0 0;
    margin: 0 1rem 0 0;
    line-height: 1.5;
    color: #ffcc00;
  }
  ul {
    flex: 1 1 auto;
    list-style: none;
    margin: 0;
    padding: 0;
    border-radius: 7px;
    display: flex;
    flex-wrap: wrap;
    font-weight: normal;
    align-items: center;
    font-size: 1.2em;
    li {
      flex: 1 1 40%;
      margin: 0;
      padding: 1rem;
      position: relative;
      &:last-child {
        border-bottom: 0;
      }
      .with-extra {
        position: relative;
      }
      .extra {
        color: #666;
        display: inline-block;
        position: absolute;
        bottom: -1.25rem;
        left: 0rem;
        font-size: 0.6em;
        font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        letter-spacing: 0;
        background: #393939;
        border-radius: 7px;
        padding: 0.2rem 0.3rem;
        text-align: center;
        line-height: 1.2;
      }
    }
  }
`;

const Organization = styled.section`
  padding: 4rem 0;
  background: #fff;
  .org-content {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 2rem;
    > div {
      margin: 0 -2rem;
      display: flex;
      > div {
        margin: 0 2rem;
        flex: 1 1 100%;
      }
    }
  }
`;

const FeatureItemContainer = styled.li`
  display: flex;
  align-items: center;
  .icon {
    margin-right: 2rem;
    font-size: 0.7em;
    color: #f5911e;
  }
`;

function FeatureItem(props) {
  return (
    <FeatureItemContainer>
      <span className="icon">
        <FontAwesomeIcon icon="star" />
      </span>
      {props.children}
    </FeatureItemContainer>
  );
}

const messages = defineMessages({
  emailPlaceholder: {
    id: "app.auth.email_placeholder",
    defaultMessage: "Email"
  },
  passwordPlaceholder: {
    id: "app.auth.password_placeholder",
    defaultMessage: "Password"
  },
  loginLabel: {
    id: "app.auth.login_label",
    defaultMessage: "Login"
  },
  forgotPasswordTitle: {
    id: "app.auth.forgot_password_title",
    defaultMessage: "Forgot my password"
  }
});

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      subscribeFormData: { name: "", email: "" },
      subscribed: false,
      loginFormData: {}
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
        hasMail: res.hasMail
      });
    });
  };
  _handleSubscribeChange = ({ target }) => {
    this.setState({
      subscribeFormData: {
        ...this.state.subscribeFormData,
        [target.name]: target.value
      }
    });
  };
  _handleSubscribeSubmit = ev => {
    ev.preventDefault();
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
  };
  _handlePasswordLoginSubmit = ev => {
    ev.preventDefault();
    const { loginFormData } = this.state;
    if (loginFormData.email && loginFormData.password) {
      Meteor.loginWithPassword(
        loginFormData.email,
        loginFormData.password,
        err => {
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
        [target.name]: target.value
      }
    });
  };
  _handleForgotPwdClick = ev => {
    ev.preventDefault();
    const { intl } = this.props;
    modalStore.setType("small");
    modalStore.setTitle(intl.formatMessage(messages.forgotPasswordTitle));
    modalStore.set(<ForgotPassword />);
  };
  render() {
    const { intl, isLoggedIn, invite } = this.props;
    const { loading, isClosed, hasMail, subscribed } = this.state;
    const user = Meteor.user();
    return (
      <Page>
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
          {isClosed && hasMail && !user && !invite ? (
            <>
              <ClosedContainer>
                <h3>
                  <FormattedMessage
                    id="app.mail_subscription.disabled_message"
                    defaultMessage="The creation of new campaigns is currently disabled."
                  />
                </h3>
                {!subscribed ? (
                  <>
                    <p>
                      <FormattedMessage
                        id="app.mail_subscription.form_text"
                        defaultMessage="If you'd like to receive updates, subscribe below:"
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
                      <p className="privacy-text">
                        <FormattedHTMLMessage
                          id="app.mail_subscription.privacy_text"
                          defaultMessage="By submitting this form you agree with our <a href='{url}' target='_blank'>privacy policy</a>."
                          values={{
                            url:
                              "https://files.liane.cc/legal/privacy_policy_v1_pt-br.pdf"
                          }}
                        />
                      </p>
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
              <hr />
            </>
          ) : null}
          {!isLoggedIn || !user ? (
            <LoginFormContainer>
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
                        href={FlowRouter.path("App.campaign.new")}
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
                  <input type="text" disabled value={user.emails[0].address} />
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
          <Intro>
            <div className="first">
              <div className="intro-text">
                <p>
                  <FormattedMessage
                    id="app.intro_text_1"
                    defaultMessage="Liane is a set of open and free technologies and solutions, developed by Instituto Update to boost innovative and low-cost political campaigns in Latin America."
                  />
                </p>
                <p>
                  <FormattedMessage
                    id="app.intro_text_2"
                    defaultMessage="Offers access to powerful tools empowering campaigns that seeks political innovation, that being the development of practices to bring citizens closer to politics, fight inequalities and strengthen democracy."
                  />
                </p>
              </div>
            </div>
          </Intro>
          <Features>
            <div>
              <ul>
                <FeatureItem>
                  <FormattedMessage
                    id="app.features.canvas"
                    defaultMessage="Electoral canvas for planning"
                  />
                </FeatureItem>
                <FeatureItem>
                  <FormattedMessage
                    id="app.features.crm"
                    defaultMessage="Contacts and relationship management"
                  />
                </FeatureItem>
                <FeatureItem>
                  <FormattedMessage
                    id="app.features.volunteers_donors"
                    defaultMessage="Donors and volunteers management"
                  />
                </FeatureItem>
                <FeatureItem>
                  <FormattedMessage
                    id="app.features.conversations"
                    defaultMessage="Manage Facebook conversations"
                  />
                </FeatureItem>
                <FeatureItem>
                  <FormattedMessage
                    id="app.features.map"
                    defaultMessage="Mapping of actions in the territory"
                  />
                </FeatureItem>
                <FeatureItem>
                  <span className="with-extra">
                    <span className="extra">
                      <FormattedMessage id="app.soon" defaultMessage="soon" />
                    </span>
                    <FormattedMessage
                      id="app.features.audience"
                      defaultMessage="Facebook audience analysis"
                    />
                  </span>
                </FeatureItem>
              </ul>
            </div>
          </Features>
          <p className="support-text">
            <FormattedHTMLMessage
              id="app.support_message"
              defaultMessage="Need help or would like to report a problem? Write to <a href='mailto:info@liane.voto'>info@liane.voto</a> and talk to our team."
            />
          </p>
          <Organization>
            <div className="org-content">
              <div>
                <div>
                  <h2>Instituto Update</h2>
                  <p>
                    <FormattedMessage
                      id="app.home.instituto_update"
                      defaultMessage="Instituto Update is a not-for-profit civil society organization that fosters political innovation in Latin America. Develops intelligence and civic technology projects to bring citizens closer to politics and strengthen democracy based on the vision of political renovation centered on diversity and combating inequalities."
                    />
                  </p>
                </div>
                <div>
                  <h2>
                    <FormattedMessage
                      id="app.home.liane_header"
                      defaultMessage="Who was Liane?"
                    />
                  </h2>
                  <p>
                    <FormattedMessage
                      id="app.home.liane_text"
                      defaultMessage="The name is a tribute to Liane Lira, friend and activist who passed away in 2015 and dedicated her life to processes of mobilization, strengthening democracy and political transparency."
                    />
                  </p>
                </div>
              </div>
            </div>
          </Organization>
        </Container>
      </Page>
    );
  }
}

Home.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(Home);
