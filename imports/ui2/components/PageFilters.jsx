import React, { Component } from "react";
import styled, { css } from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-size: 0.8em;
  .filters {
    flex: 1 1 100%;
    overflow: auto;
    padding: 3rem 0 2rem 1rem;
  }
  .main-input {
    font-size: 1.2em;
    background: #fff;
  }
  .actions {
    flex: 0 0 auto;
    .button {
      background: #fff;
      margin: 0;
      border-color: #ddd;
      border-right: 0;
      .icon {
        border-color: #ddd;
      }
      .disabled {
        color: #999;
      }
      &:hover,
      &:active,
      &:focus {
        color: #333;
      }
    }
  }
  label.boxed {
    display: flex;
    align-items: center;
    border-radius: 7px;
    border: 1px solid #ddd;
    padding: 0.7rem 1rem;
    &:hover,
    &:focus,
    &:active {
      background-color: #fff;
    }
    input[type="checkbox"],
    input[type="radio"] {
      flex: 0 0 auto;
      margin: 0 1rem 0 0;
    }
    .tip {
      display: block;
      font-size: 0.8em;
      color: #999;
    }
    .chart {
      width: auto;
      margin-bottom: -0.7rem;
      margin-left: -1rem;
      margin-right: -1rem;
    }
  }
  h4 {
    margin: 0 0 0.5rem;
    color: #666;
    font-weight: 600;
  }
  .from-to-input {
    font-size: 0.8em;
    margin: 0 0 1rem;
    .input {
      display: flex;
      align-items: center;
      input {
        margin: 0;
        padding: 0.5rem;
      }
      .between {
        padding: 0 0.5rem;
      }
    }
  }
  .reaction-count-input {
    margin: 0 0 1rem;
    font-size: 0.8em;
    .input {
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 0.5rem;
      span {
        white-space: nowrap;
        ${"" /* flex: 0 0 auto; */}
        display: inline-block;
        padding-right: 0.5rem;
        &:last-child {
          flex: 1 1 100%;
          padding-right: 0;
        }
      }
      input {
        padding: 0.5rem;
        margin: 0;
        width: 100%;
      }
    }
  }
`;

const CategoryContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 7px;
  border: 1px solid #ddd;
  margin: 0 0 1rem;
  label {
    width: 100%;
    box-sizing: border-box;
    border-radius: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 0;
    margin: 0 !important;
    border-bottom: 1px solid #ddd;
    padding: 0.7rem 1rem;
    cursor: pointer;
    &:first-child {
      border-radius: 7px 7px 0 0;
    }
    &:last-child {
      border-bottom: 0;
      border-radius: 0 0 7px 7px;
    }
    .icon {
      flex: 0 0 auto;
      margin-right: 1rem;
      width: 20px;
      text-align: center;
      color: #666;
    }
    &:hover,
    &:focus,
    &:active {
      background: #fff;
    }
    &.active {
      background: #306;
      color: #fff;
      font-weight: 600;
      .icon {
        font-weight: normal;
        color: #fff;
      }
    }
  }
  ${props =>
    props.hiddenInput &&
    css`
      input[type="radio"],
      input[type="checkbox"] {
        display: none;
      }
    `}
`;

export default class PageFilters extends Component {
  static Category = CategoryContainer;
  render() {
    const { children, ...props } = this.props;
    return <Container {...props}>{children}</Container>;
  }
}
