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
  .close-background {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
  .modal {
    width: 80%;
    max-width: 800px;
    margin: 6rem auto;
    border-radius: 7px;
    background: #fff;
    position: relative;
    z-index: 2;
    header.modal-header {
      border-radius: 7px 7px 0 0;
      background: #330066;
      border-bottom: 1px solid #222;
      padding: 1.5rem 3rem;
      h2 {
        color: rgba(255, 255, 255, 0.75);
        font-size: 1em;
        margin: 0;
        line-height: 1;
      }
    }
    .modal-content {
      padding: 2rem 3rem;
    }
  }
  &.small {
    .modal {
      max-width: 500px;
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
  componentDidUpdate() {
    const node = document.getElementById("modal");
    if (node) {
      node.focus();
    }
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
  _handleCloseClick = () => {
    modalStore.reset();
  };
  render() {
    const { title, children, type } = this.props;
    let className = "";
    if (type) className += type + " ";
    if (children) {
      return (
        <Container active={!!children} className={className} tabIndex="-1">
          <a
            href="javascript:void(0);"
            onClick={this._handleCloseClick}
            className="close-background"
          />
          <div className="modal">
            {title ? (
              <header className="modal-header">
                <h2>{title}</h2>
              </header>
            ) : null}
            <section className="modal-content">{children}</section>
          </div>
        </Container>
      );
    } else {
      return null;
    }
  }
}
