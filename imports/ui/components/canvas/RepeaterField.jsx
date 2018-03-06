import React from "react";
import PropTypes from "prop-types";
import { Header, Label, Button } from "semantic-ui-react";
import CanvasField from "./CanvasField.jsx";
import styled from "styled-components";
import { set } from "lodash";

const Item = styled.div`
  margin: 0 0 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 3px;
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
    if (this.props.value) {
      this.setState({ value: this.props.value });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    if (JSON.stringify(value) !== JSON.stringify(nextProps.value)) {
      this.setState({ value: nextProps.value });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { onChange, config } = this.props;
    const { value } = this.state;
    if (JSON.stringify(prevState.value) !== JSON.stringify(value)) {
      if (onChange) onChange(null, { name: config.key, value: value });
    }
  }
  _handleChange = (e, { name, value }) => {
    let newData = [...this.state.value];
    set(newData, name, value);
    this.setState({
      value: newData
    });
  };
  _new(ev) {
    ev.preventDefault();
    const { config } = this.props;
    const { value } = this.state;
    if (!config.limit || value.length < config.limit) {
      this.setState({
        value: [...value, {}]
      });
    }
  }
  _item(value, i) {
    const { config } = this.props;
    return (
      <Item key={i}>
        {config.fields.map(field => (
          <CanvasField
            key={field.key}
            config={{ ...field, key: `[${i}]${field.key}` }}
            onChange={this._handleChange}
            value={value[field.key]}
          />
        ))}
      </Item>
    );
  }
  render() {
    const { config } = this.props;
    const { value } = this.state;
    return (
      <div>
        <Button size="small" floated="right" onClick={this._new}>
          + Add new
        </Button>
        <Header size="small">
          {config.label}
          {config.limit ? (
            <Label>
              {value.length}/{config.limit}
            </Label>
          ) : null}
        </Header>
        {value.map((item, i) => this._item(item, i))}
      </div>
    );
  }
}
