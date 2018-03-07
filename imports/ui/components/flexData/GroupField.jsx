import React from "react";
import styled from "styled-components";
import { Header, Accordion, Icon, Label } from "semantic-ui-react";
import FlexDataField from "./FlexDataField.jsx";

const Wrapper = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  .ui.header {
    color: #999;
  }
`;

export default class GroupField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }
  componentDidMount() {
    if (this.props.value) {
      this.setState(this.props.value);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.value) !== JSON.stringify(nextProps.value)) {
      this.setState(nextProps.value);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { onChange, config } = this.props;
    if (JSON.stringify(prevState) !== JSON.stringify(this.state)) {
      if (onChange) onChange(null, { name: config.key, value: this.state });
    }
  }
  _handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };
  _handleClick = () => {
    const { active } = this.state;
    this.setState({ active: !active });
  };
  _hasValues = () => {
    const { config } = this.state;
    let hasValues = false;
    for (const field of config.field) {
      hasValues = !!this.state[field.key];
    }
  };
  render() {
    const { config } = this.props;
    const { active } = this.state;
    return (
      <Accordion>
        <Accordion.Title active={active} onClick={this._handleClick}>
          <Icon name="dropdown" />
          {config.label}{" "}
          <Label size="tiny" basic>{config.fields.length} field(s)</Label>
        </Accordion.Title>
        <Accordion.Content active={active}>
          {config.fields.map(field => (
            <FlexDataField
              key={field.key}
              config={field}
              onChange={this._handleChange}
              value={this.state[field.key]}
            />
          ))}
        </Accordion.Content>
      </Accordion>
    );
  }
}
