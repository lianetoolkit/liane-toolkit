import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

const Container = styled.div`
  display: block;
  position: relative;
  margin-bottom: 0.75rem;
  .text {
    margin-left: 0.5rem;
    font-size: 0.9em;
    color: #666;
    text-decoration: none;
    background: #f7f7f7;
    padding: 0.2rem 0.7rem;
    position: relative;
    z-index: 1;
    svg {
      margin-left: 0.5rem;
    }
    &:hover {
      color: #000;
    }
  }
  &:before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    margin-top: -1px;
    height: 1px;
    background: #ccc;
  }
`;

export default class More extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false
    };
  }
  _handleClick = ev => {
    ev.preventDefault();
    this.setState({
      active: !this.state.active
    });
  };
  render() {
    const { children, text, ...props } = this.props;
    const { active } = this.state;
    return (
      <>
        <Container {...props}>
          <a
            className="text"
            href="javascript:void(0);"
            onClick={this._handleClick}
          >
            {text}
            <FontAwesomeIcon icon={active ? "chevron-up" : "chevron-down"} />
          </a>
        </Container>
        {/* {active ? children : null} */}
        {children}
      </>
    );
  }
}
