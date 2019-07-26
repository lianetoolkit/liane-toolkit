import { Meteor } from "meteor/meteor";
import React from "react";
import i18n from "meteor/universe:i18n";
import {
  Button,
  Checkbox,
  Form,
  Icon,
  Grid,
  Segment,
  Input,
  Divider,
  Header,
  Message
} from "semantic-ui-react";

import { validateEmail } from "./Utils";

export default class SignInPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      email: "",
      password: "",
      loading: false
    };
    this._onSubmit = this._onSubmit.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }
  _handleChange = (e, { name, value }) => this.setState({ [name]: value });
  _facebookLogin(event) {
    event.preventDefault();
    Meteor.loginWithFacebook(
      {
        requestPermissions: [
          "public_profile",
          "email",
          "publish_pages",
          "manage_pages",
          "pages_show_list",
          "ads_management",
          "ads_read",
          "business_management",
          "pages_messaging",
          "pages_messaging_phone_number",
          "pages_messaging_subscriptions"
        ]
      },
      err => {
        if (err) {
          console.log(err);
        } else {
          Meteor.call("users.exchangeFBToken", (err, data) => {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    );
  }
  pathFor(pathName) {
    return FlowRouter.path(pathName);
  }
  _onSubmit(event) {
    const email = this.state.email;
    const password = this.state.password;
    const errors = {};

    if (!email) {
      errors.email = i18n.__("pages.authPageSignIn.emailRequired");
    }
    const validEmail = validateEmail(email);
    if (!validEmail) {
      errors.email = i18n.__("pages.authPageSignIn.emailInvalid");
    }

    if (!password) {
      errors.password = i18n.__("pages.authPageSignIn.passwordRequired");
    }
    this.setState({ errors });
    if (Object.keys(errors).length) {
      return;
    }
    this.setState({ loading: true });
    Meteor.loginWithPassword(email, password, err => {
      if (err) {
        this.setState({
          errors: { none: err.reason },
          loading: false
        });
      } else {
        this.setState({ loading: false });
        FlowRouter.go("App.dashboard");
      }
    });
  }

  render() {
    const { errors } = this.state;
    const errorMessages = Object.keys(errors).map(key => errors[key]);
    const errorClass = key => errors[key] && "error";
    return (
      <Form className={`large ${this.state.loading ? "loading" : ""}`}>
        <Segment raised padded>
          <Header as="h4" color="grey">
            {i18n.__("pages.authPageSignIn.signInReason")}
          </Header>
          <Divider hidden />
          {errorMessages.map((msg, index) => (
            <Message negative size="tiny" key={index}>
              {msg}
            </Message>
          ))}
          <Form.Input
            icon="user"
            iconPosition="left"
            type="email"
            name="email"
            onChange={this._handleChange}
            value={this.state.email}
            placeholder={i18n.__("pages.authPageSignIn.yourEmail")}
          />
          <Form.Input
            icon="lock"
            iconPosition="left"
            type="password"
            name="password"
            onChange={this._handleChange}
            value={this.state.password}
            placeholder="Password"
          />
          <Button fluid primary onClick={this._onSubmit}>
            {i18n.__("pages.authPageJoin.signIn")}
          </Button>
          <Divider />
          <Button fluid color="facebook" onClick={this._facebookLogin}>
            <Icon name="facebook" /> Login with Facebook
          </Button>
          <Divider />
          <div className="signIn-help">
            {i18n.__("pages.authPageSignIn.needAccount")}{" "}
            <a href={this.pathFor("Accounts.join")} className="accounts-join">
              {i18n.__("pages.authPageJoin.joinNow")}
            </a>
          </div>
          <div className="signIn-help">
            {i18n.__("pages.authPageSignIn.forgotPassword")}{" "}
            <a
              href={this.pathFor("Accounts.forgotPassword")}
              className="forgot-password"
            >
              {i18n.__("pages.authPageRecoveryPassword.recoverNow")}
            </a>
          </div>
          <Divider />
          <a
            href="//www.iubenda.com/privacy-policy/21067437"
            className="iubenda-white iubenda-embed"
            title="Privacy Policy"
          >
            Privacy Policy
          </a>
        </Segment>
      </Form>
    );
  }
}
