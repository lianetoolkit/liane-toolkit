import React from "react";
import PropTypes from "prop-types";
import { Form } from "semantic-ui-react";
import CanvasField from "./CanvasField.jsx";

export default class CanvasForm extends React.Component {
  static propTypes = {
    section: PropTypes.string
  };
  render() {
    const { config } = this.props;
    if(config && config.fields) {
      return (
        <Form>
          {config.fields.map(field => (
            <CanvasField key={field.key} config={field} />
          ))}
        </Form>
      );
    } else {
      return null;
    }
  }
}
