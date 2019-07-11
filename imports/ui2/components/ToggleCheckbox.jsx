import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.label`
  cursor: pointer;
  .fa-toggle-off,
  .fa-toggle-on {
    font-size: 1.3em;
    display: inline-block;
    margin-right: 1rem;
  }
  .fa-toggle-off {
    color: #ccc;
  }
  .fa-toggle-on {
    color: green;
  }
  &:hover {
    .fa-toggle-off {
      color: green;
    }
    .fa-toggle-on {
      color: #333;
    }
  }
  ${props => props.secondary && css`
    font-size: 0.8em;
    font-weight: 400;
  `}
`;

export default class ToggleCheckbox extends Component {
  _handleClick = ev => {
    ev.preventDefault();
    const { onChange, name, checked } = this.props;
    onChange &&
      onChange({ target: { type: "checkbox", name, checked: !checked } });
  };
  render() {
    const { checked, secondary, children } = this.props;
    return (
      <Container onClick={this._handleClick} secondary={secondary}>
        <FontAwesomeIcon icon={checked ? "toggle-on" : "toggle-off"} />
        {children}
      </Container>
    );
  }
}
