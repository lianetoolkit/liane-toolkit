import React, { Component } from "react";
import styled from "styled-components";

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
    margin-top: 50px;
    .alert {
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
        background: #006633;
      }
    }
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
            <div
              key={alert.id}
              onClick={this._handleClick(alert.id)}
              className={`alert ${alert.type}`}
            >
              {alert.content}
            </div>
          ))}
        </div>
      </Container>
    );
  }
}
