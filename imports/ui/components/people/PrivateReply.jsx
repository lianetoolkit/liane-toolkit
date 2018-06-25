import React from "react";
import { Form, Radio, TextArea, Button, Icon } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

export default class PrivateReply extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      messageType: props.defaultMessage ? "auto" : "custom",
      message: ""
    };
  }
  _handleChange = (ev, { name, value }) => this.setState({ [name]: value });
  _handleSubmit = ev => {
    ev.preventDefault();
    const {
      personId,
      campaignId,
      comment,
      defaultMessage,
      onSubmit
    } = this.props;
    const { message, messageType } = this.state;
    this.setState({ loading: true });
    Meteor.call(
      "people.sendPrivateReply",
      {
        personId,
        campaignId,
        message,
        type: messageType,
        commentId: comment._id
      },
      (err, res) => {
        this.setState({ loading: false });
        if (err) {
          Alerts.error(err.message);
        } else {
          Alerts.success("Message sent successfully.");
        }
        if (onSubmit) onSubmit();
      }
    );
  };
  render() {
    const { campaignId, defaultMessage, received } = this.props;
    const { loading, messageType, message } = this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
        {defaultMessage ? (
          <Form.Group>
            <Form.Field
              control={Radio}
              name="messageType"
              value="auto"
              label="Send automatic message"
              onChange={this._handleChange}
              checked={messageType == "auto"}
            />
            <Form.Field
              control={Radio}
              name="messageType"
              value="custom"
              label="Send custom message"
              onChange={this._handleChange}
              checked={messageType == "custom"}
            />
          </Form.Group>
        ) : (
          <p>
            You can set a{" "}
            <a href={FlowRouter.path("App.campaignSettings", { campaignId })}>
              default message on your campaign settings
            </a>.
          </p>
        )}
        {received ? (
          <p>This person already received an automatic private reply.</p>
        ) : null}
        <Form.Field
          disabled={messageType == "auto"}
          control={TextArea}
          name="message"
          value={messageType == "auto" ? defaultMessage : message}
          onChange={this._handleChange}
        />
        <Button primary floated="right" icon disabled={loading}>
          <Icon loading={loading} name={loading ? "spinner" : "comments"} />{" "}
          Send private reply
        </Button>
      </Form>
    );
  }
}
