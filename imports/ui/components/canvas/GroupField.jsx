import React from "react";
import styled from "styled-components";
import { Header } from "semantic-ui-react";
import CanvasField from "./CanvasField.jsx";

const Wrapper = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 3px;
  .ui.header {
    color: #999;
  }
`;

export default class GroupField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._handleChange = this._handleChange.bind(this);
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
  render() {
    const { config } = this.props;
    return (
      <Wrapper>
        <Header size="tiny">{config.label}</Header>
        {config.fields.map(field => (
          <CanvasField
            key={field.key}
            config={field}
            onChange={this._handleChange}
            value={this.state[field.key]}
          />
        ))}
      </Wrapper>
    );
    // return null;
  }
}
