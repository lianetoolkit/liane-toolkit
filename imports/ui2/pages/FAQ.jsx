import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { modalStore } from "../containers/Modal.jsx";
import { alertStore } from "../containers/Alerts.jsx";

import Page from "../components/Page.jsx";
import Loading from "../components/Loading.jsx";
import Form from "../components/Form.jsx";
import Button from "../components/Button.jsx";
import CopyToClipboard from "../components/CopyToClipboard.jsx";

const ViewContainer = styled.article`
  h2 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 2rem;
  }
  p {
    color: #333;
  }
  aside {
    text-align: right;
    font-size: 0.8em;
    a {
      margin-left: 0.5rem;
      color: #999;
      display: inline-block;
      border: 1px solid #ddd;
      border-radius: 7px;
      padding: 0.25rem 0.7rem;
      text-decoration: none;
      &:hover,
      &:focus,
      &:active {
        background: #63c;
        border-color: #63c;
        color: #fff;
      }
    }
  }
`;

class FAQView extends Component {
  _handleEditClick = ev => {
    const { item } = this.props;
    ev.preventDefault();
    modalStore.setTitle("Editando resposta");
    modalStore.set(<FAQEdit item={item} />);
  };
  _handleRemoveClick = ev => {
    const { item } = this.props;
    if (confirm("Tem certeza que deseja remover esta resposta?")) {
      Meteor.call("faq.remove", { _id: item._id }, (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add("Removido com sucesso", "success");
          modalStore.reset();
        }
      });
    }
  };
  render() {
    const { item } = this.props;
    if (!item) return null;
    return (
      <ViewContainer>
        <h2>{item.question}</h2>
        <p>{item.answer}</p>
        <aside>
          <CopyToClipboard text={item.answer}>
            <FontAwesomeIcon icon="copy" /> Copiar para área de transferência
          </CopyToClipboard>
          <a href="javascript:void(0);" onClick={this._handleEditClick}>
            <FontAwesomeIcon icon="edit" /> Editar
          </a>
          <a href="javascript:void(0);" onClick={this._handleRemoveClick}>
            <FontAwesomeIcon icon="times" /> Remover
          </a>
        </aside>
      </ViewContainer>
    );
  }
}

const EditContainer = styled.div``;

class FAQEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {
        question: "",
        answer: ""
      }
    };
  }
  componentDidMount() {
    const { campaignId, item } = this.props;
    if (item && item._id && item.campaignId) {
      this.setState({
        campaignId: item.campaignId,
        formData: item
      });
    } else if (campaignId) {
      this.setState({ campaignId });
    }
  }
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaignId, onSuccess } = this.props;
    const { _id, question, answer } = this.state.formData;
    this.setState({
      loading: true
    });
    if (!_id) {
      Meteor.call(
        "faq.create",
        { campaignId, question, answer },
        (err, res) => {
          this.setState({
            loading: false
          });
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add("Resposta criada com sucesso", "success");
            if (typeof onSuccess == "function") {
              onSuccess(res);
            }
          }
        }
      );
    } else {
      Meteor.call("faq.update", { _id, question, answer }, (err, res) => {
        this.setState({
          loading: false
        });
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add("Resposta atualizada com sucesso", "success");
          if (typeof onSuccess == "function") {
            onSuccess(res);
          }
        }
      });
    }
  };
  _handleChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value
      }
    });
  };
  submitLabel = () => {
    const { formData } = this.state;
    if (formData._id) {
      return "Atualizar resposta";
    } else {
      return "Criar resposta";
    }
  };
  render() {
    const { formData, loading } = this.state;
    return (
      <EditContainer>
        <Form onSubmit={this._handleSubmit}>
          <Form.Field label="Pergunta frequente">
            <input
              type="text"
              placeholder="Descreva a pergunta frequente"
              onChange={this._handleChange}
              name="question"
              value={formData.question}
            />
          </Form.Field>
          <Form.Field label="Resposta">
            <textarea
              placeholder="Escreva a resposta padrão para esta pergunta"
              onChange={this._handleChange}
              name="answer"
              value={formData.answer}
            />
          </Form.Field>
          <input disabled={loading} type="submit" value={this.submitLabel()} />
        </Form>
      </EditContainer>
    );
  }
}

const Container = styled.div`
  .page-actions {
    text-align: right;
    margin: 0 0 2rem;
    font-size: 0.8em;
    .new-faq {
      margin: 0;
    }
  }
  .faq-list {
    display: flex;
    flex-wrap: wrap;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    article {
      font-size: 0.8em;
      flex: 1 1 20%;
      margin: 0 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 7px;
      background: #fff;
      height: 230px;
      display: flex;
      flex-direction: column;
      header {
        h2 {
          font-family: "Open sans", "Helvetica Neue", Helvetica, Arial,
            sans-serif;
          font-size: 1em;
          margin: 0;
          a {
            display: block;
            text-decoration: none;
            padding: 0.5rem 0.75rem;
            border-bottom: 1px solid #ddd;
            flex: 0 0 auto;
            background: #f0f0f0;
            color: #666;
            border-radius: 7px 7px 0 0;
            &:hover,
            &:active,
            &:focus {
              color: #000;
            }
          }
        }
      }
      section {
        flex: 1 1 100%;
        padding: 0.5rem 0.75rem;
        overflow: hidden;
        color: #333;
        position: relative;
        &:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 0 0 7px 7px;
          background: rgb(255, 255, 255, 0);
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 1) 75%
          );
        }
        p {
          margin: 0;
        }
        .item-actions {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 0 0 7px 7px;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.1s linear;
          a {
            font-size: 1.2em;
            width: 50px;
            height: 50px;
            margin: 0.5rem;
            border-radius: 100%;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #63c;
            background: #fff;
            &:hover {
              color: #fff;
              background: #63c;
            }
          }
          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
`;

export default class FAQPage extends Component {
  _handleNewClick = ev => {
    const { campaignId } = this.props;
    ev.preventDefault();
    modalStore.setTitle(`Criando nova resposta`);
    modalStore.set(
      <FAQEdit campaignId={campaignId} onSuccess={this._handleCreateSuccess} />
    );
  };
  _handleCreateSuccess = () => {
    modalStore.reset();
  };
  _handleViewClick = item => ev => {
    ev.preventDefault();
    modalStore.set(<FAQView item={item} />);
  };
  _handleEditClick = item => ev => {
    ev.preventDefault();
    modalStore.setTitle("Editando resposta");
    modalStore.set(<FAQEdit item={item} />);
  };
  render() {
    const { loading, faq } = this.props;
    if (loading) {
      return <Loading full />;
    }
    return (
      <Page.Content full>
        <Page.Title>Perguntas Frequentes</Page.Title>
        <Container>
          <div className="page-actions">
            <Button className="button new-faq" onClick={this._handleNewClick}>
              + Criar nova resposta de pergunta frequente
            </Button>
          </div>
          <section className="faq-list">
            {faq.map(item => (
              <article key={item._id} className="faq-item">
                <header>
                  <h2>
                    <a
                      href="javascript:void(0);"
                      onClick={this._handleViewClick(item)}
                    >
                      {item.question}
                    </a>
                  </h2>
                </header>
                <section>
                  <p>{item.answer}</p>
                  <aside className="item-actions">
                    <CopyToClipboard
                      text={item.answer}
                      data-tip="Copiar"
                      data-for={`faq-${item._id}`}
                    >
                      <FontAwesomeIcon icon="copy" />
                    </CopyToClipboard>
                    <a
                      href="javascript:void(0);"
                      onClick={this._handleViewClick(item)}
                      data-tip="Visualizar"
                      data-for={`faq-${item._id}`}
                    >
                      <FontAwesomeIcon icon="eye" />
                    </a>
                    <a
                      href="javascript:void(0);"
                      onClick={this._handleEditClick(item)}
                      data-tip="Editar"
                      data-for={`faq-${item._id}`}
                    >
                      <FontAwesomeIcon icon="edit" />
                    </a>
                  </aside>
                  <ReactTooltip id={`faq-${item._id}`} effect="solid" />
                </section>
              </article>
            ))}
          </section>
        </Container>
      </Page.Content>
    );
  }
}
