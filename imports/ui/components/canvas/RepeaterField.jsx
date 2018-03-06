import React from "react";
import PropTypes from "prop-types";
import { Header, Label, Button, Icon, Divider } from "semantic-ui-react";
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
      value: [],
      activeIndex: 0
    };
    this._new = this._new.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handlePrevClick = this._handlePrevClick.bind(this);
    this._handleNextClick = this._handleNextClick.bind(this);
  }
  componentDidMount() {
    const { value } = this.props;
    if (value) {
      this.setState({ value });
    } else {
      if (!value || !value.length) {
        this._new();
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    if (JSON.stringify(value) !== JSON.stringify(nextProps.value)) {
      this.setState({ value: nextProps.value });
    }
    if (!this.state.value || !this.state.value.length) {
      this._new();
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { onChange, config } = this.props;
    const { value } = this.state;
    if (JSON.stringify(prevState.value) !== JSON.stringify(value)) {
      if (onChange) onChange(null, { name: config.key, value: value });
    }
    if (!value || !value.length) {
      this._new();
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
    if (ev) {
      ev.preventDefault();
    }
    const { config } = this.props;
    const { value } = this.state;
    if (!config.limit || value.length < config.limit) {
      this.setState({
        value: [...value, {}],
        activeIndex: value.length
      });
    }
  }
  _handlePrevClick(ev) {
    if (ev) ev.preventDefault();
    const { activeIndex } = this.state;
    if (activeIndex > 0) {
      this.setState({
        activeIndex: activeIndex - 1
      });
    }
  }
  _handleNextClick(ev) {
    if (ev) ev.preventDefault();
    const { activeIndex, value } = this.state;
    if (activeIndex < value.length - 1) {
      this.setState({
        activeIndex: activeIndex + 1
      });
    }
  }
  _item(i) {
    const { value } = this.state;
    const { config } = this.props;
    if (value.length) {
      const itemValue = value[i];
      return (
        <Item key={i}>
          {config.fields.map(field => (
            <CanvasField
              key={field.key}
              config={{ ...field, key: `[${i}]${field.key}` }}
              onChange={this._handleChange}
              value={itemValue[field.key]}
            />
          ))}
        </Item>
      );
    }
    return null;
  }
  render() {
    const { value, activeIndex } = this.state;
    const { config } = this.props;
    return (
      <div>
        <Header size="small" floated="left">
          {config.label}
        </Header>
        <Button basic size="small" floated="right" onClick={this._new}>
          + Add new
        </Button>
        <Button.Group size="mini" basic>
          <Button icon="chevron left" onClick={this._handlePrevClick} />
          <Button icon="chevron right" onClick={this._handleNextClick} />
        </Button.Group>{" "}
        <Label basic size="tiny">
          {activeIndex + 1}/{value.length}
        </Label>{" "}
        {config.limit ? (
          <Label basic size="tiny">
            <span>max: {config.limit}</span>
          </Label>
        ) : null}
        <Divider hidden />
        {this._item(activeIndex)}
        <Divider hidden />
      </div>
    );
  }
}
