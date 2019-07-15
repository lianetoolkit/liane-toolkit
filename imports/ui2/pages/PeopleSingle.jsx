import React, { Component } from "react";
import styled from "styled-components";

import Page from "../components/Page.jsx";
import Table from "../components/Table.jsx";

import PersonMetaButtons from "../components/PersonMetaButtons.jsx";
import PersonReactions from "../components/PersonReactions.jsx";
import PersonSummary from "../components/PersonSummary.jsx";
import PersonInfoTable from "../components/PersonInfoTable.jsx";

import CommentList from "../components/CommentList.jsx";

const Container = styled.div`
  width: 100%;
  display: flex;
  .person-container {
    flex: 1 1 100%;
    display: flex;
    flex-direction: column;
    .person-content {
      flex: 1 1 100%;
      background: #fff;
      overflow: auto;
    }
  }
  header.person-header {
    flex: 0 0 auto;
    display: flex;
    padding: 2rem;
    border-bottom: 1px solid #ddd;
    .main-info {
      flex: 1 1 100%;
      h1 {
        margin: 0;
      }
      ul {
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: 0.75em;
        color: #666;
        li {
          display: inline-block;
          margin-right: 1rem;
          &.highlight {
            color: #000;
            font-weight: 600;
          }
        }
      }
    }
  }
`;

const InformationContainer = styled.section`
  padding: 2rem;
  .person-summary {
    display: flex;
    width: 100%;
    align-items: center;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #eee;
    color: #333;
    font-size: 0.9em;
    li {
      border-width: 0;
      margin: 0 2rem 0 0;
      padding: 0;
      svg {
        color: #63c;
      }
      .copy {
        font-size: 0.8em;
        svg {
          color: #999;
        }
      }
      &:first-child {
        font-size: 1.1em;
      }
    }
  }
  .person-reactions-count {
    padding-bottom: 2rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #eee;
    justify-content: flex-start;
    li {
      margin-right: 2rem;
    }
  }
`;

class Information extends Component {
  render() {
    const { person, tags } = this.props;
    return (
      <InformationContainer>
        <PersonSummary
          person={person}
          tags={tags}
          hideIfEmpty={{
            tags: true
          }}
        />
        <PersonReactions person={person} />
        <PersonInfoTable person={person} />
      </InformationContainer>
    );
  }
}

const CommentsContainer = styled.section``;

class Comments extends Component {
  render() {
    const { campaignId, comments } = this.props;
    return (
      <CommentsContainer>
        <CommentList campaignId={campaignId} comments={comments} />
      </CommentsContainer>
    );
  }
}

export default class PeopleSingle extends Component {
  render() {
    const { campaignId, person, tags, comments, section } = this.props;
    if (person) {
      return (
        <Container>
          <Page.Nav padded full>
            <a
              href={FlowRouter.path(
                "App.people.detail",
                { personId: person._id },
                { section: null }
              )}
              className={!section ? "active" : ""}
            >
              Informações
            </a>
            <a
              href={FlowRouter.path(
                "App.people.detail",
                { personId: person._id },
                { section: "reactions" }
              )}
              className={section == "reactions" ? "active" : ""}
            >
              Reações
            </a>
            <a
              href={FlowRouter.path(
                "App.people.detail",
                { personId: person._id },
                { section: "comments" }
              )}
              className={section == "comments" ? "active" : ""}
            >
              Comentários
            </a>
            <a href="javascript:void(0);">Editar informações</a>
          </Page.Nav>
          <div className="person-container">
            <header className="person-header">
              <div className="main-info">
                <h1>{person.name}</h1>
                <ul>
                  <li className="highlight">Apoiador, Mobilizador</li>
                  <li>Origem: Facebook</li>
                </ul>
              </div>
              <PersonMetaButtons person={person} />
            </header>
            <div className="person-content">
              {!section ? <Information person={person} tags={tags} /> : null}
              {section == "comments" ? (
                <Comments campaignId={campaignId} comments={comments} />
              ) : null}
            </div>
          </div>
        </Container>
      );
    }
    return null;
  }
}
