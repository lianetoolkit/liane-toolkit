import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Page from "../components/Page.jsx";
import PageFilters from "../components/PageFilters.jsx";
import Reaction from "../components/Reaction.jsx";
import Button from "../components/Button.jsx";
import Comment from "../components/Comment.jsx";

const Container = styled.div`
  flex: 1 1 100%;
  overflow: auto;
  background: #fff;
`;

const CommentContainer = styled.article`
  border-bottom: 1px solid #ddd;
  font-size: 0.9em;
  display: flex;
  justify-content: center;
  .comment-content {
    flex: 1 1 100%;
    header h3 {
      margin-top: 0.5rem;
    }
  }
  .comment-reply,
  .comment-actions,
  .comment-resolve {
    flex: 0 0 auto;
    padding: 1rem;
    border-left: 1px solid #eee;
    ${"" /* background: #f7f7f7;
    border-left: 1px solid #eee; */}
  }
  .comment-reply {
    .reaction-filter {
      margin-bottom: 0.5rem;
    }
    .button-group {
      font-size: 0.8em;
    }
  }
  .action-icons {
    display: flex;
    a {
      width: 40px;
      height: 40px;
      display: flex;
      margin: 0 0.25rem;
      justify-content: center;
      align-items: center;
      color: #63c;
      background-color: rgba(102, 51, 204, 0);
      border: 1px solid rgba(102, 51, 204, 0.25);
      border-radius: 100%;
      transition: all 0.1s linear;
      &:hover,
      &:focus {
        background-color: #63c;
        color: #fff;
      }
    }
  }
  .comment-resolve {
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 102, 51, 0.1);
    border-left: 1px solid #eee;
    a {
      width: 40px;
      height: 40px;
      display: flex;
      margin: 0 0.5rem;
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      color: #006633;
      &:hover,
      &:focus {
        background: #006633;
        color: #fff;
      }
    }
  }
  .action-label {
    font-size: 0.8em;
    color: #666;
  }
`;

export default class CommentsPage extends Component {
  render() {
    const { comments } = this.props;
    return (
      <>
        <Page.Nav full plain>
          <PageFilters>
            <div className="filters">
              <form onSubmit={ev => ev.preventDefault()}>
                <input
                  className="main-input"
                  type="text"
                  placeholder="Buscar por texto"
                  name="q"
                  // onChange={this._handleFormChange}
                  // value={query.q}
                />
              </form>
            </div>
          </PageFilters>
        </Page.Nav>
        <Container>
          {comments.length ? (
            <div>
              {comments.map((comment, i) => (
                <CommentContainer key={comment._id}>
                  <div className="comment-content">
                    <Comment comment={comment} />
                  </div>
                  <div className="comment-reply">
                    <p className="action-label">Reagir e responder</p>
                    <Reaction.Filter target={comment._id} />
                    <Button.Group>
                      <Button>Responder</Button>
                      <Button>Inbox</Button>
                    </Button.Group>
                  </div>
                  <div className="comment-actions">
                    <p className="action-label">Classificar</p>
                    <div className="action-icons">
                      <a
                        href="javascript:void(0);"
                        data-tip="Marcar como pergunta"
                      >
                        <FontAwesomeIcon icon="question" />
                      </a>
                      <a
                        href="javascript:void(0);"
                        data-tip="Marcar como declaração de voto"
                      >
                        <FontAwesomeIcon icon="thumbs-up" />
                      </a>
                      <a
                        href="javascript:void(0);"
                        data-tip="Marcar pessoa como troll"
                      >
                        <FontAwesomeIcon icon="ban" />
                      </a>
                    </div>
                  </div>
                  <div className="comment-resolve">
                    <a
                      href="javascript:void(0);"
                      data-tip="Marcar com resolvido"
                    >
                      <FontAwesomeIcon icon="check" />
                    </a>
                  </div>
                </CommentContainer>
              ))}
              <ReactTooltip effect="solid" />
            </div>
          ) : null}
        </Container>
      </>
    );
  }
}
