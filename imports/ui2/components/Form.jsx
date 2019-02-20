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
`;

const FormContent = styled.div`
  max-width: 600px;
  margin: 4rem auto;
`;

const Actions = styled.div`
  background: #fff;
  padding: 2rem;
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

export default class Form extends Component {
  static Content = Content;
  static Actions = Actions;
  render() {
    const { children } = this.props;
    return <Container>{children}</Container>;
  }
}
