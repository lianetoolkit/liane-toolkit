import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  input,
  .button {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 1.25rem;
    line-height: 1;
    margin: 0 0 1rem;
    border: 0;
    border: 1px solid #ccc;
    border-radius: 0;
    background: #f7f7f7;
    font-size: 1em;
    border-radius: 1.625rem;
    font-family: "Open Sans", "Helvetica", "Arial", sans-serif;
    &:focus {
      background: #fff;
    }
  }
`;

const ContentContainer = styled.div`
  flex: 1 1 100%;
  overflow: auto;
  box-sizing: border-box;
`;

const FormContent = styled.div`
  max-width: 600px;
  margin: 4rem auto;
`;

class Content extends Component {
  render() {
    const { children } = this.props;
    return (
      <ContentContainer>
        <FormContent>{children}</FormContent>
      </ContentContainer>
    );
  }
}

const ActionsContainer = styled.div`
  ${"" /* border-top: 1px solid #ddd; */};
`;

const ActionsContent = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 1rem auto;
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

export default class Form extends Component {
  static Content = Content;
  static Actions = Actions;
  render() {
    const { children, ...props } = this.props;
    return <Container {...props}>{children}</Container>;
  }
}
