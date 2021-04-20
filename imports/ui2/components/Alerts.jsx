import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { alertStore } from "../containers/Alerts.jsx";

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  font-size: 0.8em;
  pointer-events: none;
  .alerts {
    pointer-events: none;
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: 70px;
  }
`;

const Alert = styled.div`
  flex: 0 0 auto;
  max-width: 600px;
  pointer-events: auto;
  color: #fff;
  padding: 0.5rem 1rem;
  background: #444;
  border-radius: 7px;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
  margin: 0 0 0.25rem;
  text-align: center;
  cursor: default;
  &.success {
    background: #f9ae3b;
    .alert-text {
      margin-left: 1rem;
    }
    ${props =>
      !props.verbose &&
      css`
        position: fixed;
        top: 40%;
        left: 50%;
        font-size: 4em;
        border-radius: 100%;
        width: 150px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        margin-top: -75px;
        margin-left: -75px;
        pointer-events: none;
        box-sizing: border-box;
        padding: 0;
        .alert-text {
          display: none;
        }
      `}
  }
  &.error {
    background: #ca3333;
  }
`;

export default class Alerts extends Component {
  _handleClick = id => ev => {
    ev.preventDefault();
    alertStore.remove(id);
  };
  render() {
    const { alerts } = this.props;
    return (
      <Container>
        <div className="alerts">
          {alerts.map(alert => (
            <Alert
              verbose={alert.config.verbose}
              key={alert.id}
              onClick={this._handleClick(alert.id)}
              className={`alert ${alert.type}`}
            >
              {alert.type == "success" ? (
                <FontAwesomeIcon icon="check" />
              ) : null}
              <span className="alert-text">{alert.content}</span>
            </Alert>
          ))}
        </div>
      </Container>
    );
  }
}
