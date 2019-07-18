import React, { Component } from "react";
import styled from "styled-components";
import { get } from "lodash";
import { OAuth } from "meteor/oauth";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";

import { alertStore } from "../containers/Alerts.jsx";

import AddressField from "../components/AddressField.jsx";
import SkillsField from "../components/SkillsField.jsx";
// import PeoplePrivacyPolicy from "/imports/ui/components/people/PeoplePrivacyPolicy.jsx";
import Recaptcha from "react-recaptcha";
import { getFormUrl } from "../utils/people.js";
import Loading from "../components/Loading.jsx";
import Button from "../components/Button.jsx";
import Form from "../components/Form.jsx";

const recaptchaSiteKey = Meteor.settings.public.recaptcha;

const Header = styled.header`
  background: #fff;
  padding: 1rem 0;
  .header-content {
    max-width: 700px;
    margin: 0 auto;
    h1 {
      margin: 0;
      img {
        max-width: 50px;
        height: auto;
      }
    }
  }
`;

const Container = styled.div`
  max-width: 700px;
  margin: 4rem auto;
  h2 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 2em;
  }
  .not-you {
    color: #999;
    margin-top: -1rem;
    font-size: 0.8em;
    margin-bottom: 2rem;
  }
  form {
    padding: 2rem;
    margin: 2rem -2rem 2rem;
    border: 1px solid #ddd;
    border-radius: 7px;
    background: #fff;
  }
  .facebook-connect {
    .button {
      background: #3b5998;
      color: #fff;
      margin: 0;
      svg {
        margin-right: 1rem;
      }
      &:hover,
      &:active,
      &:focus {
        background: #333;
      }
    }
  }
  .contribute {
    margin-top: 1rem;
  }
  .policy {
    margin: 2rem 0 1rem;
    font-size: 0.8em;
    color: #666;
  }
  .recaptcha-container {
    margin: 2rem 0 0 0;
    .g-recaptcha > div {
      margin: 0 auto;
    }
  }
`;

export default class PeopleForm extends Component {
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
          address: get(nextProps.person, "campaignMeta.basic_info.address"),
          skills: get(nextProps.person, "campaignMeta.basic_info.skills"),
          supporter: get(nextProps.person, "campaignMeta.supporter"),
          mobilizer: get(nextProps.person, "campaignMeta.mobilizer"),
          donor: get(nextProps.person, "campaignMeta.donor")
        }
      });
    }
  }
  _handleChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.type == "checkbox" ? target.checked : target.value
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
              alertStore.add(err);
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
  _handleSubmit(ev) {
    ev.preventDefault();
    const { formId, campaign } = this.props;
    const { formData } = this.state;
    let data = { ...formData, campaignId: campaign._id };
    if (formId) {
      data.formId = formId;
    }
    Meteor.call("peopleForm.submit", data, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add("Obrigado por ajudar nossa campanha!", "success");
      }
      if (res) {
        FlowRouter.go("/f/" + res);
      }
    });
  }
  getBirthdayValue() {
    const { formData } = this.state;
    const value = get(formData, "birthday");
    if (value) {
      return moment(value);
    }
    return null;
  }
  render() {
    const { contribute } = this.state;
    const { loading, person, campaign } = this.props;
    const { formData } = this.state;
    if (loading) {
      return <Loading full />;
    } else if (person && campaign) {
      return (
        <>
          <Header>
            <div className="header-content">
              <h1>
                <a href={FlowRouter.path("App.dashboard")}>
                  <img src="/images/logo_icon.svg" alt="Liane" />
                </a>
              </h1>
            </div>
          </Header>
          <Container id="app">
            <h2>
              Olá
              {person.name ? <span> {person.name}</span> : null}!
            </h2>
            {person._id ? (
              <p className="not-you">
                Não é você?{" "}
                <a href={getFormUrl(false, campaign)}>Clique aqui</a>.
              </p>
            ) : null}
            <p>
              {campaign.forms && campaign.forms.crm ? (
                <span>{campaign.forms.crm.header}</span>
              ) : (
                <span>
                  Nós, da candidatura {campaign.name}, queremos pedir sua ajuda!
                </span>
              )}
            </p>
            <p>
              {campaign.forms && campaign.forms.crm ? (
                <span>{campaign.forms.crm.text}</span>
              ) : (
                <span>
                  Preencha os dados abaixo que a gente possa saber mais sobre
                  você.
                </span>
              )}
            </p>
            {!person.facebookId ? (
              <div className="facebook-connect">
                <Button
                  fluid
                  color="facebook"
                  icon
                  onClick={this._handleFacebookClick}
                >
                  <FontAwesomeIcon icon={["fab", "facebook-square"]} /> Connect
                  your Facebook profile
                </Button>
              </div>
            ) : null}
            <Form onSubmit={this._handleSubmit}>
              {!person.name ? (
                <Form.Field label="Nome">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={this._handleChange}
                  />
                </Form.Field>
              ) : null}
              <Form.Field label="Email">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Telefone">
                <input
                  type="text"
                  name="cellphone"
                  value={formData.cellphone}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label="Data de nascimento">
                <DatePicker
                  onChange={date => {
                    this._handleChange({
                      target: {
                        name: "birthday",
                        value: date.toDate()
                      }
                    });
                  }}
                  selected={this.getBirthdayValue()}
                  dateFormatCalendar="MMMM"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </Form.Field>
              <AddressField
                name="address"
                country={campaign.country}
                value={formData.address}
                onChange={target => this._handleChange({ target })}
              />
              <Button
                className=""
                onClick={ev => {
                  ev.preventDefault();
                  this.setState({ contribute: !contribute });
                }}
              >
                Quero participar da campanha!
              </Button>
              {contribute ? (
                <div className="contribute">
                  <Form.Field label="O que você saber fazer?">
                    <SkillsField
                      name="skills"
                      value={formData.skills || []}
                      onChange={this._handleChange}
                    />
                  </Form.Field>
                  <label>
                    <input
                      type="checkbox"
                      name="supporter"
                      checked={formData.supporter}
                      onChange={this._handleChange}
                    />
                    Se a gente te mandar conteúdo, você compartilha nas suas
                    redes?
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="mobilizer"
                      checked={formData.mobilizer}
                      onChange={this._handleChange}
                    />
                    Você puxaria um evento no seu bairro ou trabalho?
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="donor"
                      checked={formData.donor}
                      onChange={this._handleChange}
                    />
                    Você doaria dinheiro para a campanha?
                  </label>
                </div>
              ) : null}
              {/* <Divider /> */}
              {!person.facebookId && recaptchaSiteKey ? (
                <div className="recaptcha-container">
                  <Recaptcha
                    sitekey={recaptchaSiteKey}
                    render="explicit"
                    verifyCallback={this._handleRecaptcha}
                  />
                  {/* <Divider hidden /> */}
                </div>
              ) : null}
              <p className="policy">
                Ao enviar este formulário você concorda com nossa{" "}
                <a
                  href="https://files.liane.cc/legal/privacy_policy_v1_pt-br.pdf"
                  target="_blank"
                  rel="external"
                >
                  Política de Privacidade
                </a>
                .
              </p>
              <input type="submit" value="Enviar" />
            </Form>
          </Container>
        </>
      );
    } else {
      return (
        <Container id="app">
          {/* <Message
            color="red"
            icon="warning sign"
            header="Invalid request"
            content="Form is not available for this request."
          /> */}
        </Container>
      );
    }
  }
}
