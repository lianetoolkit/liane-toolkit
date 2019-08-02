import React, { Component } from "react";
import styled from "styled-components";

import { alertStore } from "../containers/Alerts.jsx";

import PersonMetaButtons from "./PersonMetaButtons.jsx";
import PersonTags from "./PersonTags.jsx";
import PersonFormInfo from "./PersonFormInfo.jsx";
import Loading from "./Loading.jsx";

const Container = styled.span`
  position: relative;
  z-index: 10;
`;

const PopupContainer = styled.div`
  position: absolute;
  left: 100%;
  top: 0;
  width: 340px;
  padding: 0 1rem;
  .person-popup-content {
    background: #fff;
    border-radius: 7px;
    margin-top: -1rem;
    padding: 1rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
    position: relative;
    &:before {
      content: "";
      left: 0;
      top: 0;
      width: 10px;
      height: 10px;
      transform: rotate(45deg);
      margin-top: 1.4rem;
      margin-left: -5px;
      background: #fff;
      position: absolute;
    }
  }
  .person-meta-buttons {
    margin-bottom: 1rem;
  }
`;

export default class PersonNamePopup extends Component {
  constructor(props) {
    super(props);
    this.state = { person: false, loaded: false, loading: false, open: false };
  }
  _fetch = () => {
    const { personId } = this.props;
    this.setState({ loading: true });
    Meteor.call("people.detail", { personId }, (err, res) => {
      this.setState({ loading: false });
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          person: res,
          loaded: true
        });
      }
    });
  };
  _handleMouseEnter = () => {
    this.leaveTimeout && clearTimeout(this.leaveTimeout);
    const { loaded } = this.state;
    this._fetch();
    this.setState({ open: true });
  };
  _handleMouseLeave = () => {
    this.leaveTimeout = setTimeout(() => {
      this.setState({
        open: false
      });
    }, 1000);
  };
  _handleChange = data => {
    const { person } = this.state;
    this.setState({
      person: {
        ...person,
        campaignMeta: {
          ...person.campaignMeta,
          [data.metaKey]: data.metaValue
        }
      }
    });
  };
  render() {
    const { personId, name } = this.props;
    const { loading, person, open } = this.state;
    return (
      <Container
        onMouseEnter={this._handleMouseEnter}
        onMouseLeave={this._handleMouseLeave}
      >
        <span className="name">
          <a href={FlowRouter.path("App.people.detail", { personId })}>
            {name}
          </a>
        </span>
        {open ? (
          <PopupContainer className="person-popup">
            <div className="person-popup-content">
              {loading ? (
                <Loading />
              ) : (
                <>
                  <PersonMetaButtons
                    person={person}
                    onChange={this._handleChange}
                  />
                  <PersonFormInfo person={person} simple />
                  <PersonTags tags={person.tags} person={person} />
                </>
              )}
            </div>
          </PopupContainer>
        ) : null}
      </Container>
    );
  }
}
