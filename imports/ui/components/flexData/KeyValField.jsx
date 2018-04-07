import React from "react";
import PropTypes from "prop-types";
import {
  Header,
  Label,
  Button,
  Icon,
  Divider,
  Form,
  Input
} from "semantic-ui-react";
import FlexDataField from "./FlexDataField.jsx";
import styled from "styled-components";
import { setWith, clone } from "lodash";

const Wrapper = styled.div`
  .description {
    margin-top: -0.5em;
  }
`;

const Item = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  .ui.header {
    color: #999;
  }
`;

export default class RepeaterField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: []
    };
    this._new = this._new.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }
  componentDidMount() {
    const { value } = this.props;
    if (value && value.length) {
      this.setState({ value: value.slice(0) });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { value } = this.state;
    if (JSON.stringify(value) != JSON.stringify(nextProps.value)) {
      this.setState({ value: nextProps.value ? nextProps.value.slice(0) : [] });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { onChange, config } = this.props;
    const { value } = this.state;
    if (JSON.stringify(prevState.value) != JSON.stringify(value)) {
      if (onChange) onChange(null, { name: config.key, value: value });
    }
  }
  _handleChange = (e, { name, value }) => {
    const newData = { data: this.state.value ? this.state.value.slice(0) : [] };
    const newValue = setWith(clone(newData), name, value, clone).data;
    console.log(newValue);
    this.setState({
      value: newValue
    });
  };
  _new(ev) {
    if (ev) {
      ev.preventDefault();
    }
    const { config } = this.props;
    const { value } = this.state;
    const newValue = [...value, { key: "", val: "" }];
    this.setState({
      value: newValue
    });
  }
  render() {
    const { value } = this.state;
    const { config } = this.props;
    return (
      <Wrapper>
        <Header size="small" floated="left">
          {config.label}
        </Header>
        <Button as="a" basic size="small" floated="right" onClick={this._new}>
          + Add new
        </Button>
        <Divider hidden clearing />
        {config.description ? (
          <p className="description">{config.description}</p>
        ) : null}
        {value.length ? (
          <Item>
            {value.map((item, i) => (
              <Form.Group key={`item-${i}`} widths="equal">
                <Form.Field
                  control={Input}
                  name={`data[${i}].key`}
                  value={item.key}
                  placeholder="Field name"
                  onChange={this._handleChange}
                />
                <Form.Field
                  control={Input}
                  name={`data[${i}].val`}
                  value={item.val}
                  placeholder="Field value"
                  onChange={this._handleChange}
                />
              </Form.Group>
            ))}
          </Item>
        ) : (
          <p>
            <a href="#" onClick={this._new}>
              Create your first item.
            </a>
          </p>
        )}
        <Divider hidden />
      </Wrapper>
    );
  }
}
