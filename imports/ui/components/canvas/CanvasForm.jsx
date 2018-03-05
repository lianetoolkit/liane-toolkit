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
    this.state = {};
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
    this.setState(values);
  }
  componentWillReceiveProps(nextProps) {
    const { config } = this.props;
    if (JSON.stringify(nextProps.config) !== config) {
      this.setState({});
    }
  }
  _handleChange = (e, { name, value }) => {
    let newState = Object.assign({}, this.state);
    set(newState, name, value);
    this.setState(newState);
  };
  _handleSubmit(ev) {
    const { onSubmit } = this.props;
    ev.preventDefault();
    if (onSubmit) {
      onSubmit(this.state);
    }
  }
  render() {
    const { config, canvas, ...props } = this.props;
    if (config && config.fields) {
      console.log(this.state);
      return (
        <Form {...props} onSubmit={this._handleSubmit}>
          {config.fields.map(field => (
            <CanvasField
              key={field.key}
              config={field}
              onChange={this._handleChange}
              value={this.state[field.key]}
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
