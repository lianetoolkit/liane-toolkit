import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";

import AppNavDropdown from "./AppNavDropdown.jsx";

const ItemContainer = styled.article`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
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
  _handleClick = ev => {
    ev.preventDefault();
    const { id, path, unread } = this.props;
    if (unread) Meteor.call("notifications.read", { notificationId: id });
    if (path) {
      FlowRouter.go(path);
    }
  };
  render() {
    const { children, unread, date } = this.props;
    let className = "";
    if (unread) {
      className += " unread";
    }
    return (
      <ItemContainer className={className} onClick={this._handleClick}>
        {children}
        {date ? <span className="date"> {moment(date).fromNow()}</span> : null}
      </ItemContainer>
    );
  }
}

class NotificationsPopup extends Component {
  _getUnreadCount = () => {
    const { notifications } = this.props;
    return notifications.filter(n => n.read == false).length || null;
  };
  render() {
    const { notifications, children, ...props } = this.props;
    const hasUnread = notifications.filter(n => !n.read).length;
    return (
      <AppNavDropdown
        title="Notifications"
        {...props}
        trigger={children}
        triggerCount={this._getUnreadCount()}
        tools={
          <div>
            {hasUnread ? (
              <a href="javascript:void(0);">
                <FormattedMessage
                  id="app.notifications.mark_all_as_read"
                  defaultMessage="Mark all as read"
                />
              </a>
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
              id={notification._id}
              unread={!notification.read}
              path={notification.path}
              date={notification.createdAt}
            >
              {notification.text}
            </NotificationItem>
          ))}
          {!notifications.length ? (
            <p
              style={{
                color: "#666",
                fontStyle: "italic",
                textAlign: "center",
                margin: "2rem 0"
              }}
            >
              <FormattedMessage
                id="app.notifications.not_found"
                defaultMessage="No notifications for now!"
              />
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
