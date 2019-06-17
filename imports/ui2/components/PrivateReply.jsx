import React, { Component } from "react";
import styled from "styled-components";

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

import Form from "./Form.jsx";
import Comment from "./Comment.jsx";
import FAQSelect from "./FAQSelect.jsx";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  .comment,
  form {
    flex: 1 1 100%;
  }
  .comment {
    margin: -2rem -2rem 2rem -2rem;
    padding: 2rem;
    font-size: 0.8em;
    background: #f7f7f7;
    border-radius: 0 0 0 7px;
    .comment-message {
      background-color: #e0e0e0;
      &:before {
        background-color: #e0e0e0;
      }
    }
  }
  .tip {
    font-style: italic;
    color: #666;
  }
  .faq-select {
    font-size: 0.9em;
  }
  .type-select {
    display: flex;
    label {
      flex: 1 1 100%;
    }
    label.disabled {
      color: #ccc;
    }
  }
`;

export default class PrivateReply extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      faq: [],
      text: ""
    };
  }
  componentDidMount() {
    this.fetchComment();
  }
  fetchComment = () => {
    const { personId } = this.props;
    this.setState({ loading: true });
    Meteor.call("people.getReplyComment", { personId }, (err, res) => {
      this.setState({
        loading: false
      });
      if (err || !res) {
        this.setState({
          errored: true
        });
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add(
            "Não foi possível encontrar um comentário para enviar mensagem privada",
            "error"
          );
        }
      } else {
        this.setState({
          comment: res.comment
        });
        this.fetchFAQ(res.comment.person.campaignId);
      }
    });
  };
  fetchFAQ = campaignId => {
    this.setState({ loading: true });
    Meteor.call("faq.query", { campaignId }, (err, res) => {
      this.setState({
        loading: false
      });
      if (!err) {
        this.setState({
          faq: res,
          type: res.length ? "faq" : "write"
        });
      }
    });
  };
  _handleTypeChange = ({ target }) => {
    this.setState({
      type: target.value,
      text: ""
    });
  };
  _handleTextChange = ({ target }) => {
    this.setState({
      text: target.value
    });
  };
  _handleFAQChange = id => {
    const { faq } = this.state;
    this.setState({
      text: id ? faq.find(item => item._id == id).answer : ""
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { text, comment } = this.state;
    if (!text) {
      alertStore.add("Mensagem não definida", "error");
      return;
    }
    this.setState({
      loading: true
    });
    Meteor.call(
      "people.sendPrivateReply",
      {
        campaignId: comment.person.campaignId,
        personId: comment.person._id,
        commentId: comment._id,
        message: text
      },
      (err, res) => {
        this.setState({
          loading: false
        });
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add("Mensagem enviada", "success");
          modalStore.reset();
        }
      }
    );
  };
  render() {
    const { loading, faq, type, errored, comment, text } = this.state;
    if (!errored && comment) {
      return (
        <Container>
          <div className="comment">
            <Comment comment={comment} />
          </div>
          {!loading ? (
            <Form onSubmit={this._handleSubmit}>
              <div className="type-select">
                <label className={!faq || !faq.length ? "disabled" : ""}>
                  <input
                    type="radio"
                    name="type"
                    value="faq"
                    onChange={this._handleTypeChange}
                    checked={type == "faq"}
                    disabled={!faq || !faq.length}
                    onKeyPress={e => e.key === "Enter" && e.preventDefault()}
                  />{" "}
                  Enviar mensagem pré-definida
                </label>
                <label>
                  <input
                    type="radio"
                    name="type"
                    value="write"
                    onChange={this._handleTypeChange}
                    checked={type == "write"}
                    onKeyPress={e => e.key === "Enter" && e.preventDefault()}
                  />{" "}
                  Escrever nova mensagem
                </label>
              </div>
              {!loading && (!faq || !faq.length) ? (
                <p className="tip">
                  Você pode utilizar mensagens pré-definidas ao criar{" "}
                  <a href={FlowRouter.path("App.faq")} target="_blank">
                    respostas para perguntas frequentes
                  </a>
                  .
                </p>
              ) : null}
              {type == "write" ? (
                <textarea
                  placeholder="Escreva uma mensagem para enviar"
                  onChange={this._handleTextChange}
                />
              ) : null}
              {faq && faq.length && type == "faq" ? (
                <FAQSelect faq={faq} onChange={this._handleFAQChange} />
              ) : null}
              <input
                type="submit"
                value="Enviar mensagem privada"
                disabled={!text}
              />
            </Form>
          ) : null}
        </Container>
      );
    }
    return null;
  }
}
