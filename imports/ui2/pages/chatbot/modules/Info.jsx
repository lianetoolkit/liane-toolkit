import React, { Component } from "react";

import Form from "/imports/ui2/components/Form.jsx";

export default class ChatbotInfoModule extends Component {
  render() {
    return (
      <Form onSubmit={ev => ev.preventDefault()}>
        <Form.Content>
          <Form.Field label="Informação básica da candidatura">
            <textarea />
          </Form.Field>
        </Form.Content>
      </Form>
    );
  }
}
