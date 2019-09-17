import React, { Component } from "react";
import styled from "styled-components";
import { detect } from "detect-browser";

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";
import Form from "./Form.jsx";

const FeedbackButtonContainer = styled.a`
  position: fixed;
  bottom: 0;
  right: 1rem;
  background: #f60;
  color: #fff;
  line-height: 1;
  padding: 0.5rem 1rem;
  border-radius: 7px 7px 0 0;
  font-size: 0.7em;
  text-decoration: none;
  &:hover,
  &:focus,
  &:active {
    background: #222;
    color: #fff;
  }
`;

export class FeedbackForm extends Component {
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
    const { formData } = this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Field label="What would like to message us about?">
          <select name="category" onChange={this._handleChange}>
            <option value="bug">Report a problem</option>
            <option value="suggestion">Give a suggestion</option>
            <option value="question">Ask a question</option>
            <option value="other">Something else</option>
          </select>
        </Form.Field>
        <Form.Field label="Name">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={this._handleChange}
          />
        </Form.Field>
        <Form.Field label="Contact email">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={this._handleChange}
          />
        </Form.Field>
        <Form.Field label="Subject">
          <input type="text" name="subject" onChange={this._handleChange} />
        </Form.Field>
        <Form.Field label="Your message">
          <textarea name="message" onChange={this._handleChange} />
        </Form.Field>
        <input type="submit" value="Send feedback" />
      </Form>
    );
  }
}

export class FeedbackButton extends Component {
  _handleClick = ev => {
    ev.preventDefault();
    modalStore.setTitle("Feedback");
    modalStore.set(<FeedbackForm />);
  };
  render() {
    return (
      <FeedbackButtonContainer
        href="javascript:void(0);"
        onClick={this._handleClick}
      >
        Feedback/Report a problem
      </FeedbackButtonContainer>
    );
  }
}
