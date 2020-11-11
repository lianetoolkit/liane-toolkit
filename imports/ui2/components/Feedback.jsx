import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import styled from "styled-components";
import { detect } from "detect-browser";

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";
import Form from "./Form.jsx";

const messages = defineMessages({
  modalTitle: {
    id: "app.feedback.modal_title",
    defaultMessage: "Feedback"
  },
  submit: {
    id: "app.feedback.submit",
    defaultMessage: "Send feedback"
  },
  categoryLabel: {
    id: "app.feedback.form.category_label",
    defaultMessage: "What would like to message us about?"
  },
  categoryOptionBug: {
    id: "app.feedback.form.categories.bug",
    defaultMessage: "Report a problem"
  },
  categoryOptionSuggestion: {
    id: "app.feedback.form.categories.suggestion",
    defaultMessage: "Give a suggestion"
  },
  categoryOptionQuestion: {
    id: "app.feedback.form.categories.question",
    defaultMessage: "Ask a question"
  },
  categoryOptionOther: {
    id: "app.feedback.form.categories.other",
    defaultMessage: "Something else"
  },
  nameLabel: {
    id: "app.feedback.form.name_label",
    defaultMessage: "Your name"
  },
  emailLabel: {
    id: "app.feedback.form.email_label",
    defaultMessage: "Contact email"
  },
  subjectLabel: {
    id: "app.feedback.form.subject_label",
    defaultMessage: "Subject"
  },
  messageLabel: {
    id: "app.feedback.form.message_label",
    defaultMessage: "Your message"
  }
});

const FeedbackButtonContainer = styled.a`
  position: fixed;
  bottom: 0;
  right: 1rem;
  background: #ca3333;
  color: #fff;
  line-height: 1;
  padding: 0.5rem 1rem;
  border-radius: 7px 7px 0 0;
  font-size: 0.7em;
  text-decoration: none;
  z-index: 1010;
  &:hover,
  &:focus,
  &:active {
    background: #222;
    color: #fff;
  }
`;

class FeedbackForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        category: "bug",
        subject: "",
        message: ""
      }
    };
  }
  componentDidMount() {
    const user = Meteor.user();
    if (user && user.name) {
      this.setState({
        formData: {
          ...this.state.formData,
          name: user.name,
          email: user.emails[0].address
        }
      });
    }
  }
  _handleChange = ({ target }) => {
    const { formData } = this.state;
    this.setState({
      formData: {
        ...formData,
        [target.name]: target.value
      }
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { formData } = this.state;
    const browser = detect();
    let data = {
      ...formData,
      context: {
        url: FlowRouter.url(FlowRouter.current().path),
        browser: browser.name,
        os: browser.os,
        version: browser.version
      }
    };
    // console.log(data);
    Meteor.call("feedback.new", data, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add("Sent", "success");
        modalStore.reset();
      }
    });
  };
  render() {
    const { intl } = this.props;
    const { formData } = this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Field label={intl.formatMessage(messages.categoryLabel)}>
          <select name="category" onChange={this._handleChange}>
            <option value="bug">
              {intl.formatMessage(messages.categoryOptionBug)}
            </option>
            <option value="suggestion">
              {intl.formatMessage(messages.categoryOptionSuggestion)}
            </option>
            <option value="question">
              {intl.formatMessage(messages.categoryOptionQuestion)}
            </option>
            <option value="other">
              {intl.formatMessage(messages.categoryOptionOther)}
            </option>
          </select>
        </Form.Field>
        <Form.Field label={intl.formatMessage(messages.nameLabel)}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={this._handleChange}
          />
        </Form.Field>
        <Form.Field label={intl.formatMessage(messages.emailLabel)}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={this._handleChange}
          />
        </Form.Field>
        <Form.Field label={intl.formatMessage(messages.subjectLabel)}>
          <input type="text" name="subject" onChange={this._handleChange} />
        </Form.Field>
        <Form.Field label={intl.formatMessage(messages.messageLabel)}>
          <textarea name="message" onChange={this._handleChange} />
        </Form.Field>
        <input type="submit" value={intl.formatMessage(messages.submit)} />
      </Form>
    );
  }
}

FeedbackForm.propTypes = {
  intl: intlShape.isRequired
};

const FeedbackFormIntl = injectIntl(FeedbackForm);

class Button extends Component {
  _handleClick = ev => {
    const { intl } = this.props;
    ev.preventDefault();
    modalStore.setTitle(intl.formatMessage(messages.modalTitle));
    modalStore.set(<FeedbackFormIntl />);
  };
  render() {
    return (
      <FeedbackButtonContainer
        href="javascript:void(0);"
        onClick={this._handleClick}
      >
        <FormattedMessage
          id="app.feedback.button_label"
          defaultMessage="Feedback/Report a problem"
        />
      </FeedbackButtonContainer>
    );
  }
}

Button.propTypes = {
  intl: intlShape.isRequired
};

export const FeedbackButton = injectIntl(Button);
