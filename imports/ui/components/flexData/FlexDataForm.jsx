import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Form, Button } from "semantic-ui-react";
import FlexDataField from "./FlexDataField.jsx";
import { setWith, clone } from "lodash";

const Wrapper = styled.div``;

export default class FlexDataForm extends React.Component {
  static propTypes = {
    data: PropTypes.array,
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
    this._updateValues(this.props.data, this.props.config.key);
  }
  _updateValues(data, sectionKey) {
    let values = {};
    if (data && data.length) {
      for (const item of data) {
        if (item.sectionKey == sectionKey) {
          values[item.key] = item.value;
        }
      }
    }
    this.setState({ formData: values });
  }
  componentWillReceiveProps(nextProps) {
    const { config, data } = this.props;
    if (
      JSON.stringify(nextProps.config) !== JSON.stringify(config) ||
      JSON.stringify(nextProps.data) !== JSON.stringify(data)
    ) {
      this._updateValues(nextProps.data, nextProps.config.key);
    }
  }
  _handleChange = (e, { name, value }) => {
    let newFormData = Object.assign({}, this.state.formData);
    this.setState({
      formData: setWith(clone(newFormData), name, value, clone)
    });
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
    const { config, data, ...props } = this.props;
    if (config && config.fields) {
      return (
        <Wrapper>
          <Form {...props} onSubmit={this._handleSubmit}>
            {config.fields.map(field => (
              <FlexDataField
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
        </Wrapper>
      );
    } else {
      return null;
    }
  }
}
