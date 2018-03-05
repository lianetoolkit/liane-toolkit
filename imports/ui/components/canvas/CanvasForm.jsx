import React from "react";
import PropTypes from "prop-types";
import { Form, Button } from "semantic-ui-react";
import CanvasField from "./CanvasField.jsx";
import { set } from "lodash";

export default class CanvasForm extends React.Component {
  static propTypes = {
    canvas: PropTypes.array,
    config: PropTypes.object
  };
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentDidMount() {
    this._updateValues(this.props.canvas, this.props.config.key);
  }
  _updateValues(canvas, sectionKey) {
    let values = {};
    if (canvas && canvas.length) {
      for (const item of canvas) {
        if (item.sectionKey == sectionKey) {
          values[item.key] = item.value;
        }
      }
    }
    this.setState({ formData: values });
  }
  componentWillReceiveProps(nextProps) {
    const { config, canvas } = this.props;
    if (
      JSON.stringify(nextProps.config) !== JSON.stringify(config) ||
      JSON.stringify(nextProps.canvas) !== JSON.stringify(canvas)
    ) {
      this._updateValues(nextProps.canvas, nextProps.config.key);
    }
  }
  _handleChange = (e, { name, value }) => {
    let newFormData = Object.assign({}, this.state.formData);
    set(newFormData, name, value);
    this.setState({ formData: newFormData });
  };
  _handleSubmit(ev) {
    const { onSubmit } = this.props;
    ev.preventDefault();
    if (onSubmit) {
      onSubmit(this.state.formData);
    }
  }
  render() {
    const { formData } = this.state;
    const { config, canvas, ...props } = this.props;
    if (config && config.fields) {
      return (
        <Form {...props} onSubmit={this._handleSubmit}>
          {config.fields.map(field => (
            <CanvasField
              key={field.key}
              config={field}
              onChange={this._handleChange}
              value={formData[field.key]}
            />
          ))}
          <Button primary fluid>
            Save
          </Button>
        </Form>
      );
    } else {
      return null;
    }
  }
}
