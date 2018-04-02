import React from "react";
import PropTypes from "prop-types";
import { Header, Label, Button, Icon, Divider } from "semantic-ui-react";
import FlexDataField from "./FlexDataField.jsx";
import styled from "styled-components";
import { setWith, clone } from "lodash";

const Wrapper = styled.div`
  .description {
    margin-top: -0.5em;
  }
`;

const Item = styled.div`
  margin: 0 0 1rem;
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
    const { activeIndex, value } = this.state;
    if (JSON.stringify(prevState.value) != JSON.stringify(value)) {
      if (onChange) onChange(null, { name: config.key, value: value });
    }
  }
  _handleChange = (e, { name, value }) => {
    const newData = { data: this.state.value ? this.state.value.slice(0) : [] };
    this.setState({
      value: setWith(clone(newData), name, value, clone).data
    });
  };
  _new(ev) {
    if (ev) {
      ev.preventDefault();
    }
    const { config } = this.props;
    const { value } = this.state;
    if (!config.limit || value.length < config.limit) {
      const newValue = [...value, {}];
      this.setState({
        value: newValue,
        activeIndex: newValue.length - 1
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
  render() {
    const { value, activeIndex } = this.state;
    const { config } = this.props;
    return (
      <Wrapper>
        <Header size="small" floated="left">
          {config.label}
        </Header>
        <Button as="a" basic size="small" floated="right" onClick={this._new}>
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
        {config.description ? (
          <p className="description">{config.description}</p>
        ) : null}
        {value.length ? (
          <Item>
            {config.fields.map(field => (
              <FlexDataField
                key={field.key}
                config={field}
                name={`data[${activeIndex}]${field.key}`}
                onChange={this._handleChange}
                value={value[activeIndex][field.key] || ""}
              />
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
