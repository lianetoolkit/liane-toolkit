import React, { Component } from "react";
import styled, { css } from "styled-components";

const Container = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  flex: 1 1 100%;
  overflow: auto;
  box-sizing: border-box;
`;

const FormContent = styled.div`
  max-width: 640px;
  margin: 3rem auto;
  padding: 0 3rem;
  h3 {
    margin-top: 3rem;
    padding-bottom: 1rem;
    color: #666;
    border-bottom: 1px solid #ddd;
  }
`;

const FieldContainer = styled.label`
  display: block;
  font-weight: normal;
  margin: 0 0 1rem;
  .label {
    color: #666;
    display: block;
    font-size: 0.8em;
    margin-bottom: 0.25rem;
  }
  .input-container {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 7px;
    > * {
      flex: 1 1 100%;
      margin: 0;
      border: 0;
    }
    input,
    textarea,
    .select-search__control,
    .select__control {
      border: 0;
      margin: 0;
    }
    .prefix {
      flex: 0 0 auto;
      font-size: 0.9em;
      color: #999;
      padding: 0 0.5rem 0 1rem;
    }
  }
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  .select__control {
    margin: 0;
  }
  .select__value-container {
    padding: 0.5rem 1rem;
  }
  &:last-child {
    margin-bottom: 0;
  }
  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    display: block;
  }
  ${props =>
    props.secondary &&
    css`
      font-size: 0.9em;
    `}
  ${props =>
    props.big &&
    css`
      font-size: 1.2em;
    `}
  ${props =>
    props.simple &&
    css`
      .input-container {
        border: 0;
      }
    `}
  &.radio-list {
    .input-container {
      padding: 1rem;
      label {
        display: flex;
        align-items: center;
        font-weight: normal;
        input {
          margin-right: 0.5rem;
        }
      }
    }
  }
`;

class Content extends Component {
  render() {
    const { children, ...props } = this.props;
    return (
      <ContentContainer {...props}>
        <FormContent>{children}</FormContent>
      </ContentContainer>
    );
  }
}

const ActionsContainer = styled.div`
  border-top: 1px solid #ddd;
`;

const ActionsContent = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem 4rem;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  button,
  input[type="submit"] {
    display: block;
    border: 0;
    background: #63c;
    padding: 1rem 1.5rem;
    border-radius: 1.625rem;
    color: #fff;
    cursor: pointer;
    font-family: "Unica One", monospace;
    letter-spacing: 0.1rem;
    margin: 0;
    &:hover,
    &:active,
    &:focus {
      background: #333;
    }
    &:disabled {
      background: #bbb;
      color: #fff;
      cursor: default;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  button,
  input[type="submit"],
  .button {
    width: auto;
    display: inline-block;
    margin-left: 1rem;
    text-decoration: none;
  }
`;

class Actions extends Component {
  render() {
    const { children } = this.props;
    return (
      <ActionsContainer>
        <ActionsContent>{children}</ActionsContent>
      </ActionsContainer>
    );
  }
}

class Field extends Component {
  render() {
    const { label, children, prefix, ...props } = this.props;
    return (
      <FieldContainer {...props}>
        <span className="label">{label}</span>
        <div className="input-container">
          {prefix ? <span className="prefix">{prefix}</span> : null}
          {children}
        </div>
      </FieldContainer>
    );
  }
}

export default class Form extends Component {
  static Content = Content;
  static Actions = Actions;
  static ButtonGroup = ButtonGroup;
  static Field = Field;
  render() {
    const { children, ...props } = this.props;
    return <Container {...props}>{children}</Container>;
  }
}
