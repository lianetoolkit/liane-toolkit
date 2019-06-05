import React, { Component } from "react";
import styled from "styled-components";

import { alertStore } from "../containers/Alerts.jsx";

import Form from "./Form.jsx";
import Comment from "./Comment.jsx";

const Container = styled.div`
  display: flex;
  .comment,
  form {
    flex: 1 1 100%;
  }
  .comment {
    max-width: 250px;
    margin: -2rem 2rem -2rem -2rem;
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
`;

export default class PrivateReply extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }
  componentDidMount() {
    this._getComment();
  }
  _getComment = () => {
    const { personId } = this.props;
    Meteor.call("people.getReplyComment", { personId }, (err, res) => {
      if (err || !res) {
        this.setState({
          errored: true
        });
        if (err) {
          console.log(err);
          alertStore.add(err);
        } else {
          alertStore.add(
            "Não foi possível encontrar um comentário para enviar mensagem privada",
            "error"
          );
        }
      } else {
        this.setState({
          comment: res.comment,
          defaultMessage: res.defaultMessage
        });
      }
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
  };
  render() {
    const { errored, comment, defaultMessage } = this.state;
    if (!errored && comment) {
      return (
        <Container>
          <div className="comment">
            <Comment comment={comment} />
          </div>
          <Form onSubmit={this._handleSubmit}>
            <Form.Field label="Responder este comentário">
              <textarea placeholder="Escreva uma mensagem para enviar" />
            </Form.Field>
            <input type="submit" value="Enviar mensagem privada" />
          </Form>
        </Container>
      );
    }
    return null;
  }
}
