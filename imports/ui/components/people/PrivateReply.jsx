import React from "react";
import { Form, Radio, TextArea, Button } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

export default class PrivateReply extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messageType: "auto",
      message: ""
    };
  }
  _handleChange = (ev, { name, value }) => this.setState({ [name]: value });
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaignId, comment } = this.props;
    const { message } = this.state;
    Meteor.call(
      "people.sendPrivateReply",
      {
        campaignId,
        message,
        commentId: comment._id
      },
      (err, res) => {
        if (err) {
          Alerts.error(err.message);
        } else {
          Alerts.success("Message sent successfully.");
          console.log(res);
        }
      }
    );
  };
  render() {
    const { messageType, message } = this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
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
        <Form.Field
          disabled={messageType == "auto"}
          control={TextArea}
          name="message"
          value={message}
          onChange={this._handleChange}
        />
        <Button primary floated="right">
          Send private reply
        </Button>
      </Form>
    );
  }
}
