import React, { Component } from "react";
import styled from "styled-components";

import Form from "../components/Form.jsx";
import Button from "../components/Button.jsx";
import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

const Container = styled.div`
  max-width: 500px;
  margin: 4rem auto;
  padding: 2rem;
  border-radius: 7px;
  border: 1px solid #ddd;
  background: #fff;
  display: flex;
  flex-direction: column;
  .info {
    flex: 1 1 100%;
  }
  h2 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 2rem;
  }
  .button.delete {
    border-radius: 7px;
  }
`;

class ConfirmRemove extends Component {
  constructor(props) {
    super(props);
    this.state = { typedEmail: "", valid: false };
  }
  componentDidUpdate(prevProps, prevState) {
    const user = Meteor.user();
    const { typedEmail } = this.state;
    if (prevState.typedEmail != typedEmail) {
      this.setState({
        valid: typedEmail == user.emails[0].address
      });
    }
  }
  _handleSubmit = ev => {
    ev.preventDefault();
    const { onConfirm } = this.props;
    if (this.state.valid) {
      onConfirm && onConfirm();
    }
  };
  render() {
    const { valid } = this.state;
    return (
      <div>
        <p>
          Remover minha conta, campanha e todos meus dados associados na
          plataforma, bem como revogar as permissões de Facebook concedidas.
        </p>
        <Form.Field label="Digite seu email completo para confirmar a remoção:">
          <input
            type="text"
            onChange={({ target }) => {
              this.setState({ typedEmail: target.value });
            }}
          />
        </Form.Field>
        <input
          disabled={!valid}
          className="button delete"
          type="submit"
          value="Remover permanentemente"
          onClick={this._handleSubmit}
        />
      </div>
    );
  }
}

export default class MyAccount extends Component {
  _handleRemoveClick = () => {
    modalStore.setType("small");
    modalStore.set(<ConfirmRemove onConfirm={this._handleRemove} />);
  };
  _handleRemove = () => {
    Meteor.call("users.removeSelf", {}, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        window.location.reload();
      }
    });
  };
  render() {
    const user = Meteor.user();
    return (
      <Container>
        <div className="info">
          <h2>
            Conectado como <strong>{user.name}</strong>
          </h2>
          <p>
            Para conectar-se a uma campanha existente envie seu email ao
            responsável para que ele possa adicioná-lo:
          </p>
          <input type="text" disabled value={user.emails[0].address} />
        </div>
        <a
          href="javascript:void(0);"
          className="button delete"
          onClick={this._handleRemoveClick}
        >
          Remover minha conta, campanha e todos meus dados associados na
          plataforma, bem como revogar as permissões de Facebook concedidas.
        </a>
      </Container>
    );
  }
}
