import React from "react";
import styled from "styled-components";
import { OAuth } from "meteor/oauth";
import {
  Dimmer,
  Loader,
  Container,
  Header,
  Divider,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Message,
  Icon
} from "semantic-ui-react";
import AddressForm from "/imports/ui/components/people/AddressForm.jsx";

const Wrapper = styled.div`
  max-width: 700px;
  margin: 4rem auto;
`;

export default class PeopleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      contribute: false,
      skillOptions: [
        "Design",
        "Vídeo",
        "Produção de eventos",
        "Redator",
        "Fotógrafo",
        "Mídias sociais",
        "Desenvolvimento Web",
        "Panfletagem"
      ]
    };
    this._handleFacebookClick = this._handleFacebookClick.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const { person } = this.props;
    if (nextProps.person && (!person || nextProps.person._id !== person._id)) {
      // Autofill with available data?
      // this.setState({
      //   formData: {
      //     ...this.state.formData,
      //     name: nextProps.person.name
      //   }
      // });
    }
  }
  _handleChange = (ev, { name, value }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value
      }
    });
  };
  _handleFacebookClick() {
    const { campaign } = this.props;
    Facebook.requestCredential(
      {
        requestPermissions: ["public_profile", "email"]
      },
      token => {
        const secret = OAuth._retrieveCredentialSecret(token) || null;
        Meteor.call(
          "peopleForm.connectFacebook",
          { token, secret, campaignId: campaign._id },
          (err, res) => {
            if (err) {
              console.log(err);
            } else {
              FlowRouter.go("/f/" + res);
            }
          }
        );
      }
    );
  }
  _handleDeleteDataClick() {
    Facebook.requestCredential({
      requestPermissions: []
    });
  }
  _handleSubmit() {
    const { formId } = this.props;
    const { formData } = this.state;
    console.log(formData);
    // Meteor.call("peopleForm.submit", { formId, ...formData }, (err, res) => {
    //   console.log(err, res);
    //   FlowRouter.go("/f/" + res);
    // });
  }
  render() {
    const { contribute, skillOptions } = this.state;
    const { loading, person, campaign, context } = this.props;
    const { formData } = this.state;
    if (loading) {
      return (
        <Dimmer active>
          <Loader />
        </Dimmer>
      );
    } else if (person && campaign) {
      return (
        <Wrapper>
          <Header size="huge">
            Olá
            {person.name ? <span> {person.name}</span> : null}
            !
          </Header>
          <Header size="large">
            Nós, da candidatura {campaign.name}, queremos pedir sua ajuda!
          </Header>
          <p>
            Preencha os dados abaixo que a gente possa saber mais sobre você.
          </p>
          {!person.facebookId ? (
            <Button
              fluid
              color="facebook"
              icon
              onClick={this._handleFacebookClick}
            >
              <Icon name="facebook" /> Connect your Facebook profile
            </Button>
          ) : null}
          <Divider />
          <Form onSubmit={this._handleSubmit}>
            {!person.name ? (
              <Form.Field
                name="name"
                control={Input}
                label="Nome"
                value={formData.name}
                onChange={this._handleChange}
              />
            ) : null}
            <Form.Field
              name="email"
              control={Input}
              label="Email"
              value={formData.email}
              onChange={this._handleChange}
            />
            <Form.Field
              name="cellphone"
              control={Input}
              label="Telefone celular"
              value={formData.cellphone}
              onChange={this._handleChange}
            />
            <Form.Field
              name="birthday"
              control={Input}
              label="Data de nascimento"
              type="date"
              value={formData.birthday}
              onChange={this._handleChange}
            />
            <AddressForm
              country={context.country}
              address={formData.address}
              onChange={address => {
                this._handleChange(null, { name: "address", value: address });
              }}
            />
            <Divider />
            <Button
              color={contribute ? "grey" : "green"}
              fluid
              icon
              onClick={ev => {
                ev.preventDefault();
                this.setState({ contribute: !contribute });
              }}
            >
              <Icon name={contribute ? "cancel" : "checkmark"} /> Quero
              participar da campanha!
            </Button>
            {contribute ? (
              <div>
                <Divider hidden />
                <Form.Field
                  name="skills"
                  control={Select}
                  multiple
                  search
                  allowAdditions={true}
                  label="O que você sabe fazer?"
                  value={formData.skills || []}
                  onChange={this._handleChange}
                  onAddItem={(ev, data) => {
                    this.setState({
                      skillOptions: [...skillOptions, data.value]
                    });
                  }}
                  fluid
                  options={skillOptions.map(skill => {
                    return {
                      key: skill,
                      value: skill,
                      text: skill
                    };
                  })}
                />
                <Form.Field
                  name="supporter"
                  control={Checkbox}
                  label="Se a gente te mandar conteúdo, você compartilha nas suas redes?"
                />
                <Form.Field
                  name="mobilizer"
                  control={Checkbox}
                  label="Você puxaria um evento no seu bairro ou trabalho?"
                />
                <Form.Field
                  name="donor"
                  control={Checkbox}
                  label="Você doaria dinheiro para a campanha?"
                />
                <Divider />
                <p>
                  <strong>
                    A sua participação vai fazer toda a diferença!
                  </strong>
                </p>
                <p>
                  <strong>Obrigado!</strong>
                </p>
              </div>
            ) : null}
            <Divider />
            <Button primary fluid>
              Enviar
            </Button>
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
