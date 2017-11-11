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

export default class AuthPageResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      validationState: {},
      token: FlowRouter.getParam("token"),
      password: "",
      confirm: "",
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
    const token = this.state.token;
    const password = this.state.password;
    const confirm = this.state.confirm;
    const errors = {};
    const validationState = {};

    if (!password) {
      validationState.password = "password";
      errors.password = i18n.__("pages.authPageSignIn.passwordRequired");
    }
    if (confirm !== password) {
      validationState.confirm = "error";
      errors.confirm = i18n.__("pages.authPageJoin.passwordConfirm");
    }

    this.setState({ errors, validationState });
    if (Object.keys(errors).length) {
      return;
    }
    this.setState({ loading: true });
    Accounts.resetPassword(token, password, err => {
      if (err) {
        console.log(err);
        this.setState({
          errors: { none: err.reason, loading: false }
        });
      } else {
        FlowRouter.go("/");
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
          <Form.Input
            icon="lock"
            iconPosition="left"
            type="password"
            name="password"
            onChange={this._handleChange}
            value={this.state.password}
            placeholder="Password"
          />
          <Form.Input
            icon="lock"
            iconPosition="left"
            type="password"
            name="confirm"
            onChange={this._handleChange}
            value={this.state.confirm}
            placeholder="Password again"
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
