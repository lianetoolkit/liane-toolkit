import React from "react";
import styled from "styled-components";
import {
  Dimmer,
  Loader,
  Container,
  Header,
  Form,
  Input,
  Button,
  Message,
  Icon
} from "semantic-ui-react";

const Wrapper = styled.div`
  max-width: 700px;
  margin: 4rem auto;
`;

export default class PeopleForm extends React.Component {
  render() {
    const { loading, person, campaign } = this.props;
    if (loading) {
      return (
        <Dimmer active>
          <Loader />
        </Dimmer>
      );
    } else if (person && campaign) {
      return (
        <Wrapper>
          <Header size="huge">Hello {person.name}!</Header>
          <Header size="large">
            Help {campaign.name} campaign by filling out this form.
          </Header>
          <Form>
            <Form.Field control={Input} label="Your age" />
            <Button primary fluid>Submit</Button>
          </Form>
        </Wrapper>
      );
    } else {
      return (
        <Wrapper>
          <Message
            color="red"
            icon="warning sign"
            header="Invalid request"
            content="Form is not available for this request."
          />
        </Wrapper>
      );
    }
  }
}
