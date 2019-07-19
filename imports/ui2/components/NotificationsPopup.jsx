import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";

import AppNavDropdown from "./AppNavDropdown.jsx";

const ItemContainer = styled.article`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #cecece;
  color: #666;
  cursor: pointer;
  position: relative;
  line-height: 1.2;
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
  render() {
    const { notifications, children, ...props } = this.props;
    const hasUnread = notifications.filter(n => !n.read).length;
    return (
      <AppNavDropdown
        title="Notifications"
        {...props}
        trigger={children}
        triggerCount={notifications.length ? notifications.length : null}
        tools={
          <div>
            {hasUnread ? (
              <a href="javascript:void(0);">Marcar tudo como lido</a>
            ) : null}
            <a href="javascript:void(0);">
              <FontAwesomeIcon icon="times" className="close" />
            </a>
          </div>
        }
      >
        {/* <AppNavDropdown.Tools /> */}
        <AppNavDropdown.Content>
          {notifications.map(notification => (
            <NotificationItem
              key={notification._id}
              unread={!notification.read}
              date={notification.createdAt}
            >
              {notification.text}
            </NotificationItem>
          ))}
          {/* <NotificationItem unread={true} date={new Date()}>
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
          </NotificationItem> */}
          {!notifications.length ? (
            <p
              style={{
                color: "#666",
                fontStyle: "italic",
                textAlign: "center",
                margin: "2rem 0"
              }}
            >
              Nenhuma notificação por enquanto!
            </p>
          ) : null}
        </AppNavDropdown.Content>
      </AppNavDropdown>
    );
  }
}

NotificationsPopup.propTypes = {
  children: PropTypes.element.isRequired
};

export default NotificationsPopup;
