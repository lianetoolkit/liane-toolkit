import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";

import { modalStore } from "../containers/Modal.jsx";

const Container = styled.div`
  position: fixed;
  overflow: hidden;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.75);
  .modal {
    width: 80%;
    max-width: 800px;
    margin: 6rem auto;
    border-radius: 7px;
    background: #fff;
    header {
      border-radius: 7px 7px 0 0;
      background: #fc0;
      padding: 1rem 2rem;
      h2 {
        font-size: 1.2em;
        margin: 0;
        line-height: 1;
      }
    }
    .modal-content {
      padding: 2rem;
    }
  }
  ${props =>
    props.active &&
    css`
      height: auto;
      bottom: 0;
      overflow: auto;
    `}
`;

export default class Modal extends Component {
  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
    window.addEventListener("keydown", this._handleKeydown);
    window.addEventListener("click", this._handleNodeClick);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this._handleKeydown);
    window.removeEventListener("click", this._handleNodeClick);
  }
  _handleKeydown = ev => {
    if (ev.keyCode == 27) {
      modalStore.reset();
    }
  };
  _handleNodeClick = ev => {
    if (ev.target == this.node) {
      modalStore.reset();
    }
  };
  render() {
    const { title, children } = this.props;
    return (
      <Container active={!!children}>
        <div className="modal">
          {title ? (
            <header>
              <h2>{title}</h2>
            </header>
          ) : null}
          <section className="modal-content">{children}</section>
        </div>
      </Container>
    );
  }
}
