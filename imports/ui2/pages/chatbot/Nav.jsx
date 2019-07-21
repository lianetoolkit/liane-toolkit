import React, { Component } from "react";
import styled, { css } from "styled-components";

import { isModuleActive } from "/imports/ui2/utils/chatbot";

import Page from "/imports/ui2/components/Page.jsx";

const ModuleLinkContainer = styled.a`
  padding-right: 0 !important;
  .module-link-content {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.2;
    margin-left: -1.5rem;
    span {
      flex: 1 1 100%;
      display: block;
    }
    span.status {
      flex: 0 0 auto;
      width: 10px;
      height: 10px;
      border-radius: 100%;
      background: #bbb;
      margin: 0 1rem 0 0;
      border: 1px solid #bbb;
    }
    .module-info {
      .label {
        padding-bottom: 0.25rem;
        margin-bottom: 0.25rem;
        border-bottom: 1px solid #eee;
        padding-right: 0.5rem;
      }
      .status-label {
        font-size: 0.8em;
        color: #999;
        font-style: italic;
        font-weight: normal;
      }
    }
  }
  ${props =>
    props.active &&
    css`
      .module-link-content {
        span.status {
          background: #00cc66;
          border-color: #00ff80;
          box-shadow: 0 0 0.5rem #00ff80;
        }
      }
    `}
  ${props =>
    props.pending &&
    css`
      .module-link-content {
        span.status {
          background: #fc0;
          border-color: #ffdf5d;
          box-shadow: 0 0 0.5rem #ffdf5d;
        }
      }
    `}
`;

class ModuleLink extends Component {
  statusLabel = () => {
    const { active, pending } = this.props;
    if (pending) return "Pending";
    if (active) return "Active";
    return "Inactive";
  };
  render() {
    const { children, ...props } = this.props;
    let statusClass = "status";
    let statusLabelClass = "status-label";
    return (
      <ModuleLinkContainer {...props}>
        <span className="module-link-content">
          <span className="status" />
          <span className="module-info">
            <span className="label">{children}</span>
            <span className="status-label">{this.statusLabel()}</span>
          </span>
        </span>
      </ModuleLinkContainer>
    );
  }
}

export default class ChatbotNav extends Component {
  render() {
    const { chatbot, customModules, module } = this.props;
    const currentRoute = FlowRouter.current().route.name;
    return (
      <Page.Nav>
        <h3>Chatbot settings</h3>
        <a
          href={FlowRouter.path("App.chatbot")}
          className={!module ? "active" : ""}
        >
          General settings
        </a>
        <a
          href={FlowRouter.path("App.chatbot", {}, { module: "actions" })}
          className={module == "actions" ? "active" : ""}
        >
          Actions
        </a>
        <h3>Modules</h3>
        <ModuleLink
          active={isModuleActive(chatbot, customModules, "info")}
          href={FlowRouter.path("App.chatbot", {}, { module: "info" })}
          className={module == "info" ? "active" : ""}
        >
          Candidate information
        </ModuleLink>
        <ModuleLink
          active={isModuleActive(chatbot, customModules, "proposals")}
          href={FlowRouter.path("App.chatbot", {}, { module: "proposals" })}
          className={module == "proposals" ? "active" : ""}
        >
          Present axes and receive proposals
        </ModuleLink>
        <ModuleLink
          active={isModuleActive(chatbot, customModules, "auto_reply")}
          href={FlowRouter.path("App.chatbot", {}, { module: "auto_reply" })}
          className={module == "auto_reply" ? "active" : ""}
        >
          Automated replies
        </ModuleLink>
        <ModuleLink
          active={isModuleActive(chatbot, customModules, "registration")}
          href={FlowRouter.path("App.chatbot", {}, { module: "registration" })}
          className={module == "registration" ? "active" : ""}
        >
          Support registration
        </ModuleLink>
        <ModuleLink
          active={isModuleActive(chatbot, customModules, "notifications")}
          href={FlowRouter.path("App.chatbot", {}, { module: "notifications" })}
          className={module == "notifications" ? "active" : ""}
        >
          Send notifications
        </ModuleLink>
      </Page.Nav>
    );
  }
}
