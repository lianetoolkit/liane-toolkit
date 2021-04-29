import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.table`
  width: 100%;
  background: #fff;
  border-spacing: 0;
  border: 1px solid #ddd;
  border-radius: 7px;
  color: #444;
  .show-on-hover {
    display: none;
  }
  a:not(.button) {
    color: #333;
    text-decoration: none;
    &:hover,
    &:active,
    &:focus {
      color: #000;
    }
  }
  tbody.active,
  tbody:hover,
  tbody:focus,
  tbody:active {
    position: relative;
    z-index: 5;
  }
  tbody.active {
    ${"" /* transform: scale(1.007); */}
    ${"" /* transition: all 0.1s linear; */}
    ${"" /* box-shadow: 0 0.7rem 1rem rgba(0, 0, 0, 0.2); */}
    ${"" /* transform-origin: 50% 100%; */}
    border-radius: 7px;
    td {
      border-color: rgba(255, 255, 255, 0.4);
      background: #f0f0f0;
      border-top: 1px solid #ddd;
    }
    tr td .show-on-hover {
      display: block;
    }
    tr:first-child {
      td:first-child {
        border-top-left-radius: 7px;
      }
      td:last-child {
        border-top-right-radius: 7px;
      }
    }
    tr:last-child {
      td:first-child {
        border-bottom-left-radius: 7px;
      }
      td:last-child {
        border-bottom-right-radius: 7px;
      }
    }
  }
  tr {
    &.interactive {
      cursor: pointer;
    }
    &:hover {
      box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.07);
      position: relative;
      z-index: 2;
      .show-on-hover {
        display: block;
      }
    }
    th,
    td {
      width: 1px;
      white-space: nowrap;
      padding: 1rem;
      line-height: 1.2;
      border-bottom: 1px solid #f7f7f7;
      border-right: 1px solid #f7f7f7;
      vertical-align: middle;
      position: relative;
      &.highlight {
        color: #000;
      }
      &.fill {
        width: auto;
        white-space: normal;
      }
      &.small {
        font-size: 0.8em;
      }
      &.icon-number {
        font-weight: 600;
        font-size: 0.9em;
        color: rgba(0, 0, 0, 0.25);
        text-align: center;
        svg {
          font-size: 0.7em;
          margin-right: 1rem;
        }
        span {
          color: #333;
          display: inline-block;
          width: 20px;
        }
      }
      &.last {
        text-align: right;
      }
      &.extra {
        border-color: #666;
        text-align: left;
        background: #555;
        font-size: 0.8em;
        color: #fff;
        a {
          color: #fff;
          text-decoration: none;
          &:hover,
          &:active,
          &:focus {
            color: #f0f0f0;
          }
        }
        .button {
          background: rgba(0, 0, 0, 0.2);
          border-color: rgba(0, 0, 0, 0.3);
        }
      }
      &:last-child {
        border-right: 0;
      }
    }
    th {
      font-size: 0.6em;
      text-transform: uppercase;
      letter-spacing: 0.1rem;
      text-align: left;
      color: #999;
      font-weight: 600;
      cursor: default;
      background: #fcfcfc;
    }
  }
  thead {
    tr {
      th {
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #ccc;
        position: sticky;
        top: 0;
        z-index: 4;
        .th-icon {
          font-size: 1.2em;
          margin-right: 0.5rem;
        }
      }
    }
  }
  tbody {
    tr:first-child {
      th:first-child {
        border-radius: 7px 0 0;
      }
    }
    tr:last-child {
      th:first-child {
        border-radius: 0 0 0 7px;
      }
    }
  }
  ${(props) =>
    props.compact &&
    css`
      border-radius: 0;
      border: 0;
      border-bottom: 1px solid #ccc;
      tbody.active {
        border-radius: 0;
        tr,
        td {
          border-radius: 0 !important;
        }
      }
    `}
`;

const SortableHeadContainer = styled.th`
  .th-container {
    color: inherit;
    display: flex;
    align-items: center;
    .th-content {
      flex: 1 1 100%;
    }
    .sort-icon {
      margin-left: 0.5rem;
      flex: 0 0 auto;
      color: #ccc;
    }
    &:hover {
      .sort-icon {
        color: #333;
      }
    }
  }
  ${(props) =>
    props.sorted &&
    css`
      .th-container .th-content {
        font-weight: 600;
        color: #333;
      }
      .th-container .sort-icon {
        color: #333;
      }
    `}
`;

class SortableHead extends Component {
  render() {
    const { children, onClick, sorted, ...props } = this.props;
    let sortIcon = "sort";
    if (sorted == "desc") {
      sortIcon = "sort-up";
    } else if (sorted == "asc") {
      sortIcon = "sort-down";
    }
    return (
      <SortableHeadContainer {...props} sorted={sorted}>
        <a
          href="javascript:void(0);"
          className="th-container"
          onClick={onClick}
        >
          <span className="th-content">{children}</span>
          <span className="sort-icon">
            <FontAwesomeIcon icon={sortIcon} />
          </span>
        </a>
      </SortableHeadContainer>
    );
  }
}

export default class Table extends Component {
  static SortableHead = SortableHead;
  render() {
    const { children, ...props } = this.props;
    return (
      <Container className="table" {...props}>
        {children}
      </Container>
    );
  }
}
