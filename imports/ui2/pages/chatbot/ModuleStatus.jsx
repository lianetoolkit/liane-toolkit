import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

import Loading from "/imports/ui2/components/Loading.jsx";

const Container = styled.header`
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  .module-status {
    flex: 1 1 100%;
    margin: 0 2rem 0 0;
    display: flex;
    align-items: center;
    h3 {
      margin: 0;
      padding: 0;
      border: 0;
    }
    p {
      margin: 0;
      font-size: 0.8em;
      color: #999;
      font-style: italic;
    }
  }
  .toggle-module {
    flex: 0 0 auto;
    color: #999;
    text-decoration: none;
    font-size: 0.8em;
    line-height: 1;
    display: flex;
    align-items: center;
    > * {
      display: inline-block;
    }
    .fa-toggle-off,
    .fa-toggle-on {
      font-size: 2em;
      display: inline-block;
      margin-left: 1rem;
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
    .loading {
      margin-right: 1rem;
    }
  }
`;

const StatusIndicator = styled.span`
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background: #bbb;
  margin: 0 2rem 0 0;
  border: 1px solid #bbb;
  ${props =>
    props.active &&
    css`
      background: #00cc66;
      border-color: #00ff80;
      box-shadow: 0 0 0.5rem #00ff80;
    `}
  ${props =>
    props.pending &&
    css`
      background: #fc0;
      border-color: #ffdf5d;
      box-shadow: 0 0 0.5rem #ffdf5d;
    `}
`;

export default class ChatbotModuleStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }
  _isActive = () => {
    if (this.props.hasOwnProperty("isActive")) return this.props.isActive;
    const { chatbot, name } = this.props;
    return get(chatbot, `extra_info.${name}.active`);
  };
  _statusLabel = () => {
    const active = this._isActive();
    if (active) {
      return "Ativo";
    } else {
      return "Inativo";
    }
  };
  _isLoading = () => {
    if (this.props.hasOwnProperty("loading")) return this.props.loading;
    return this.state.loading;
  };
  _handleActivationClick = () => {
    const { campaign, name, onChange, onActivation } = this.props;
    if (onActivation) {
      if (this._isLoading()) return false;
      onActivation();
    } else {
      const loading = this._isLoading();
      const active = this._isActive();
      if (loading) return false;
      this.setState({
        loading: true
      });
      Meteor.call(
        "chatbot.moduleActivation",
        {
          campaignId: campaign._id,
          module: name,
          active: !active
        },
        (err, res) => {
          this.setState({ loading: false });
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add("Modulo ativado", "success");
            if (onChange && typeof onChange == "function") {
              onChange(res.config);
            }
          }
        }
      );
    }
  };
  render() {
    const { label } = this.props;
    return (
      <Container>
        <div className="module-status">
          <StatusIndicator active={this._isActive()} />
          <div>
            <h3>{label}</h3>
            <p>{this._statusLabel()}</p>
          </div>
        </div>
        <a
          href="javascript:void(0);"
          className="toggle-module"
          onClick={this._handleActivationClick}
        >
          {this._isLoading() ? <Loading tiny /> : null}
          {!this._isActive() ? <span>Ativar</span> : <span>Desativar</span>}
          <FontAwesomeIcon
            icon={this._isActive() ? "toggle-on" : "toggle-off"}
          />
        </a>
      </Container>
    );
  }
}
