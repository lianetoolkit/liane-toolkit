import React from "react";
import styled from "styled-components";
import { get } from "lodash";
import { OAuth } from "meteor/oauth";
import { Alerts } from "/imports/ui/utils/Alerts.js";
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
import AddressField from "/imports/ui/components/people/AddressField.jsx";
import SkillField from "/imports/ui/components/people/SkillField.jsx";
import Recaptcha from "react-recaptcha";

const recaptchaSiteKey = Meteor.settings.public.recaptcha;

const Wrapper = styled.div`
  max-width: 700px;
  margin: 4rem auto;
`;

export default class PeopleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      contribute: false
    };
    this._handleFacebookClick = this._handleFacebookClick.bind(this);
    this._handleRecaptcha = this._handleRecaptcha.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const { person } = this.props;
    if (nextProps.person && (!person || nextProps.person._id !== person._id)) {
      // Autofill with available data?
      this.setState({
        formData: {
          ...this.state.formData,
          name: get(nextProps.person, "name"),
          email: get(nextProps.person, "campaignMeta.contact.email"),
          cellphone: get(nextProps.person, "campaignMeta.contact.cellphone"),
          birthday: get(nextProps.person, "campaignMeta.basic_info.birthday"),
          address: get(nextProps.person, "campaignMeta.basic_info.address")
        }
      });
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
  _handleCheckboxChange = (ev, { name, checked }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: checked
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
              Alerts.error(err);
            } else {
              FlowRouter.go("/f/" + res);
            }
          }
        );
      }
    );
  }
  _handleRecaptcha(res) {
    this.setState({
      formData: {
        ...this.state.formData,
        recaptcha: res
      }
    });
  }
  _handleDeleteDataClick() {
    Facebook.requestCredential({
      requestPermissions: []
    });
  }
  _handleSubmit() {
    const { formId, campaign } = this.props;
    const { formData } = this.state;
    let data = { ...formData, campaignId: campaign._id };
    if (formId) {
      data.formId = formId;
    }
    Meteor.call("peopleForm.submit", data, (err, res) => {
      if (err) {
        Alerts.error(err);
      } else {
        Alerts.success("Obrigado por ajudar nossa campanha!");
      }
      if (res) {
        FlowRouter.go("/f/" + res);
      }
    });
  }
  render() {
    const { contribute } = this.state;
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
                required
              />
            ) : null}
            <Form.Field
              name="email"
              control={Input}
              label="Email"
              value={formData.email}
              onChange={this._handleChange}
              required
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
            <AddressField
              name="address"
              country={context.country}
              value={formData.address}
              onChange={this._handleChange}
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
                <SkillField
                  name="skills"
                  label="O que você sabe fazer?"
                  value={formData.skills || []}
                  onChange={this._handleChange}
                />
                <Form.Field
                  name="supporter"
                  control={Checkbox}
                  onChange={this._handleCheckboxChange}
                  label="Se a gente te mandar conteúdo, você compartilha nas suas redes?"
                />
                <Form.Field
                  name="mobilizer"
                  control={Checkbox}
                  onChange={this._handleCheckboxChange}
                  label="Você puxaria um evento no seu bairro ou trabalho?"
                />
                <Form.Field
                  name="donor"
                  control={Checkbox}
                  onChange={this._handleCheckboxChange}
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
            {!person.facebookId && recaptchaSiteKey ? (
              <div>
                <Recaptcha
                  sitekey={recaptchaSiteKey}
                  render="explicit"
                  verifyCallback={this._handleRecaptcha}
                />
                <Divider hidden />
              </div>
            ) : null}
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
