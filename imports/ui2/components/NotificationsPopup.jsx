import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";

const Container = styled.div`
  position: relative;
  display: inline-block;
  font-weight: 400;
  .trigger {
    cursor: pointer;
  }
  .trigger-count {
    position: absolute;
    bottom: -0.5rem;
    right: -0.5rem;
    display: block;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    background: red;
    color: #fff;
    font-weight: 600;
    border-radius: 100%;
    font-size: 0.8em;
  }
  .popup {
    position: absolute;
    top: 70px;
    right: -25px;
    width: 380px;
    height: 300px;
    background: #fff;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.07);
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    &:before {
      content: "";
      background: #fff;
      position: absolute;
      width: 16px;
      height: 16px;
      top: -8px;
      right: 32px;
      transform: rotate(45deg);
    }
    .popup-tools {
      flex-grow: 0;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid #dedede;
      text-align: right;
      font-size: 0.7em;
      a {
        display: inline-block;
        margin-left: 0.75rem;
        color: #999;
        &:hover {
          color: #333;
        }
      }
      .close {
        color: #000;
        &:hover {
          color: #333;
        }
      }
    }
    .popup-content {
      flex-grow: 1;
      overflow: auto;
      box-sizing: border-box;
      font-size: 0.8em;
    }
  }
`;

const ItemContainer = styled.article`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #cecece;
  color: #666;
  cursor: pointer;
  position: relative;
  &:last-child {
    border-bottom: 0;
  }
  &:hover {
    z-index: 2;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  }
  &.unread {
    font-weight: 600;
    color: #333;
    border-width: 2px;
  }
  span.date {
    font-weight: 400;
    color: #999;
    font-size: 0.9em;
  }
`;

class NotificationItem extends Component {
  render() {
    const { children, unread, date } = this.props;
    let className = "";
    if (unread) {
      className += " unread";
    }
    return (
      <ItemContainer className={className}>
        {children}
        {date ? <span className="date"> {moment(date).fromNow()}</span> : null}
      </ItemContainer>
    );
  }
}

class NotificationsPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }
  toggle = () => () => {
    const { open } = this.state;
    this.setState({
      open: !open
    });
  };
  render() {
    const { children, ...props } = this.props;
    const { open } = this.state;
    return (
      <Container href="#" title="Notifications" {...props}>
        <span className="trigger" onClick={this.toggle()}>
          {children}
        </span>
        <span className="trigger-count">2</span>
        {open ? (
          <div className="popup">
            <div className="popup-tools">
              <a href="javascript:void(0);">Ver tudo</a>
              <a href="javascript:void(0);">Marcar tudo como lido</a>
              <a href="javascript:void(0);" onClick={this.toggle()}>
                <FontAwesomeIcon icon="times" className="close" />
              </a>
            </div>
            <div className="popup-content">
              <NotificationItem unread={true} date={new Date()}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
                sodales ac erat ut faucibus dasdas sd.
              </NotificationItem>
              <NotificationItem unread={true} date={new Date()}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
                sodales ac erat ut faucibus.
              </NotificationItem>
              <NotificationItem date={new Date(0)}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
                sodales ac erat ut faucibus.
              </NotificationItem>
              <NotificationItem date={new Date(0)}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
                sodales ac erat ut faucibus.
              </NotificationItem>
              <NotificationItem date={new Date(0)}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
                sodales ac erat ut faucibus.
              </NotificationItem>
            </div>
          </div>
        ) : null}
      </Container>
    );
  }
}

NotificationsPopup.propTypes = {
  children: PropTypes.element.isRequired
};

export default NotificationsPopup;
