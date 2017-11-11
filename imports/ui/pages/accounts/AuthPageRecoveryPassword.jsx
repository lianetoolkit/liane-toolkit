import { Accounts } from "meteor/accounts-base";
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
  Header,
  Divider,
  Message
} from "semantic-ui-react";

import { validateEmail } from "./Utils";

export default class AuthPageRecoveryPasswordPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      email: "",
      loading: false
    };
    this._onSubmit = this._onSubmit.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }
  _handleChange = (e, { name, value }) => this.setState({ [name]: value });
  pathFor(pathName) {
    return FlowRouter.path(pathName);
  }
  _onSubmit(event) {
    event.preventDefault();
    const email = this.state.email;
    const errors = {};

    if (!email) {
      errors.email = i18n.__("pages.authPageSignIn.emailRequired");
    } else {
      const validatedEmail = validateEmail(email);
      if (!validatedEmail) {
        errors.email = i18n.__("pages.authPageSignIn.emailInvalid");
      }
    }

    this.setState({ errors });
    if (Object.keys(errors).length) {
      return;
    }
    options = {
      email: email
    };
    this.setState({ loading: true });
    Accounts.forgotPassword(options, err => {
      if (err) {
        console.log(err);
        this.setState({
          errors: { none: err.reason },
          loading: false
        });
      } else {
        Alerts.success(i18n.__("pages.authPageRecoveryPassword.sentSuccess"));
        FlowRouter.go("Accounts.signin");
      }
    });
  }

  render() {
    const { errors } = this.state;
    const errorMessages = Object.keys(errors).map(key => errors[key]);
    const errorClass = key => errors[key] && "error";
    return (
      <Form className={`large ${this.state.loading ? "loading" : ""}`}>
        <Segment padded raised>
          <Header as="h4" color="grey">
            {i18n.__("pages.authPageRecoveryPassword.recoveryReason")}
          </Header>
          <Divider hidden />
          {errorMessages.map((msg, index) => (
            <Message negative size="tiny" key={index}>
              {msg}
            </Message>
          ))}
          <Message size="tiny">
            {i18n.__("pages.authPageRecoveryPassword.recoveryHelp")}
          </Message>
          <Form.Input
            icon="user"
            iconPosition="left"
            type="email"
            name="email"
            onChange={this._handleChange}
            value={this.state.email}
            placeholder="E-mail address"
          />

          <Button fluid primary onClick={this._onSubmit}>
            {i18n.__("pages.authPageRecoveryPassword.recoverNow")}
          </Button>
          <Divider />
          <div className="signIn-help">
            {i18n.__("pages.authPageJoin.haveAccount")} {" "}
            <a href={this.pathFor("Accounts.signin")}>
              {i18n.__("pages.authPageSignIn.signIn")}
            </a>
          </div>
          <div className="signIn-help">
            {i18n.__("pages.authPageSignIn.needAccount")} {" "}
            <a href={this.pathFor("Accounts.join")} className="accounts-join">
              {i18n.__("pages.authPageJoin.joinNow")}
            </a>
          </div>
        </Segment>
      </Form>
    );
  }
}
