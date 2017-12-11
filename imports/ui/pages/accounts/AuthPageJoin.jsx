import React from "react";
import { Accounts } from "meteor/accounts-base";
import i18n from "meteor/universe:i18n";
import PropTypes from "prop-types";
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

export default class JoinPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      email: "",
      terms: true,
      loading: false,
      password: "",
      confirm: ""
    };
    this._onSubmit = this._onSubmit.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }
  pathFor(pathName) {
    return FlowRouter.path(pathName);
  }
  _handleChange = (e, { name, value }) => this.setState({ [name]: value });

  _onSubmit(event) {
    event.preventDefault();
    const { email, password, confirm, terms } = this.state;

    const errors = {};

    if (!email) {
      errors.email = i18n.__("pages.authPageJoin.emailRequired");
    } else {
      const validEmail = validateEmail(email);
      if (!validEmail) {
        errors.email = i18n.__("pages.authPageSignIn.emailInvalid");
      }
    }

    if (!password) {
      errors.password = i18n.__("pages.authPageJoin.passwordRequired");
    }
    if (confirm !== password) {
      errors.confirm = i18n.__("pages.authPageJoin.passwordConfirm");
    }

    this.setState({ errors });
    if (Object.keys(errors).length) {
      return;
    }
    this.setState({ loading: true });
    Accounts.createUser(
      {
        email,
        password
      },
      err => {
        if (err) {
          console.log(err);
          this.setState({
            errors: { none: err.reason },
            loading: false
          });
          return;
        } else {
          this.setState({ loading: false });
          FlowRouter.go("/");
        }
      }
    );
  }

  render() {
    const { errors } = this.state;
    const errorMessages = Object.keys(errors).map(key => errors[key]);
    const errorClass = key => errors[key] && "error";
    return (
      <Form className={`large ${this.state.loading ? "loading" : ""}`}>
        <Segment raised padded>
          <Header as="h4" color="grey">
            {i18n.__("pages.authPageJoin.joinReason")}
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
            placeholder="E-mail address"
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
            {i18n.__("pages.authPageJoin.joinNow")}
          </Button>
          <Divider />
          <div className="signIn-help">
            {i18n.__("pages.authPageJoin.haveAccount")}{" "}
            <a href={this.pathFor("Accounts.signin")}>
              {i18n.__("pages.authPageSignIn.signIn")}
            </a>
          </div>
        </Segment>
      </Form>
    );
  }
}

JoinPage.contextTypes = {
  router: PropTypes.object,
  params: PropTypes.object
};
