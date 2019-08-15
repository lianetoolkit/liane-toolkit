import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.a`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 100%;
  padding: 0.3rem;
  line-height: 1;
  margin: 0 -0.3rem;
  width: 13px;
  height: 13px;
  text-align: center;
  display: block;
  position: relative;
  .exclamation {
    position: absolute;
    bottom: 4px;
    right: 1px;
    font-size: 1.2em;
    font-weight: 600;
    opacity: 0.5;
  }
`;

export default class PersonChatIcon extends Component {
  render() {
    const { person } = this.props;
    const status = person.chatbotStatus;
    let color, message;
    switch (status) {
      case "admin":
        color = "#006633";
        message = "Human took over";
        break;
      case "pending":
        color = "#cc0000";
        message = "Pending human interaction";
        break;
      case "bot":
        color = "#003399";
        message = "Currently interacting with bot";
        break;
      default:
        color = "#ccc";
        message = "No chat conversations";
    }
    return (
      <Container
        href="javascript:void(0);"
        style={{ color, fontSize: "0.8em" }}
      >
        <FontAwesomeIcon
          icon={["fab", "facebook-messenger"]}
          data-tip={message}
          data-for={`person-chat-status-${person._id}`}
        />
        {status == "pending" ? <span className="exclamation">!</span> : null}
        <ReactTooltip
          id={`person-chat-status-${person._id}`}
          aria-haspopup="true"
          place="top"
          effect="solid"
        />
      </Container>
    );
  }
}
