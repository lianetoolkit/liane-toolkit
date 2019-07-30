import React, { Component } from "react";
import styled, { css } from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Color = styled.a`
  width: 25px;
  height: 25px;
  border-radius: 4px;
  margin-right: 0.5rem;
  box-sizing: border-box;
  border: 0px solid rgba(0, 0, 0, 0.25);
  &:hover,
  &:active {
    border-width: 2px;
  }
  &:last-child {
    margin-right: 0;
  }
  ${props =>
    props.active &&
    css`
      border-width: 2px;
    `}
`;

export default class ColorSelector extends Component {
  static defaultProps = {
    colors: [
      "#cc0000",
      "#6633cc",
      "#ff6600",
      "#003399",
      "#ffcc00",
      "#006633",
      "#999999"
    ]
  };
  _handleClick = color => ev => {
    ev.preventDefault();
    const { onChange, name } = this.props;
    onChange && onChange({ target: { name, value: color } });
  };
  render() {
    const { colors, value } = this.props;
    return (
      <Container className="color-selector">
        {colors.map((color, i) => (
          <Color
            href="javascript:void(0);"
            key={i}
            style={{ backgroundColor: color }}
            active={value == color}
            onClick={this._handleClick(color)}
          />
        ))}
      </Container>
    );
  }
}
