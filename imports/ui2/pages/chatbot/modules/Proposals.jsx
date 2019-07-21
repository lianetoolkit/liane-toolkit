import React, { Component } from "react";
import styled, { css } from "styled-components";
import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

import Form from "/imports/ui2/components/Form.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";

import ModuleStatus from "../ModuleStatus.jsx";

const ProposalContainer = styled.div`
  background: #fcfcfc;
  border: 1px solid #ddd;
  border-radius: 7px;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
  .actions {
    position: absolute;
    top: -0.5rem;
    right: 1rem;
    font-size: 0.7em;
    display: flex;
    a {
      display: block;
      width: 1.5rem;
      height: 1.5rem;
      background: #fff;
      border-radius: 100%;
      border: 1px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 0.25rem;
      &.active {
        background: #63c;
        border-color: #63c;
        color: #fff;
      }
      &.remove {
        color: #c00;
        border-color: #f04747;
        &:hover {
          background: #c00;
          color: #fff;
          border-color: #b00404;
        }
      }
    }
  }
  .button {
    font-size: 0.8em;
  }
`;

class Proposal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.proposal.id && props.proposal.id != state.formData.id) {
      return {
        formData: props.proposal
      };
    }
    return null;
  }
  componentDidMount() {
    const { proposal } = this.props;
    this.setState({
      formData: proposal
    });
  }
  _handleChange = ({ target }) => {
    const { formData } = this.state;
    this.setState({
      formData: {
        ...formData,
        [target.name]: target.value
      }
    });
  };
  _handleRemoveClick = () => {
    const { proposal, campaignId, onRemove } = this.props;
    if (!proposal.id) {
      onRemove(undefined);
    } else if (confirm("Are you sure?")) {
      Meteor.call(
        "chatbot.removeProposal",
        { campaignId, proposalId: proposal.id },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else if (onRemove && typeof onRemove == "function") {
            onRemove(proposal.id);
          }
        }
      );
    }
  };
  _handlePrimaryClick = () => {
    const { proposal, onPrimary } = this.props;
    if (onPrimary && typeof onPrimary == "function") {
      onPrimary(proposal.id);
    }
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaignId, onSubmit } = this.props;
    const { formData } = this.state;
    Meteor.call(
      "chatbot.upsertProposal",
      { campaignId, proposal: formData },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          console.log(res);
          onSubmit && onSubmit(res, formData.id ? "update" : "insert");
          this.setState({
            formData: res
          });
          alertStore.add("Updated", "success");
        }
      }
    );
  };
  render() {
    const { target, isPrimary } = this.props;
    const { formData } = this.state;
    const tooltipId = `proposal-input-${target}`;
    return (
      <ProposalContainer>
        <div className="actions">
          {formData.id ? (
            <a
              href="javascript:void(0);"
              onClick={this._handlePrimaryClick}
              className={isPrimary ? "active" : ""}
              data-tip={isPrimary ? "Remove as primary" : "Make it primary"}
              data-for={tooltipId}
            >
              <FontAwesomeIcon icon="star" />
            </a>
          ) : null}
          <a
            href="javascript:void(0);"
            onClick={this._handleRemoveClick}
            className="remove"
            data-tip={"Delete"}
            data-for={tooltipId}
          >
            <FontAwesomeIcon icon="times" />
          </a>
        </div>
        <Form.Field label="Axis title">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={this._handleChange}
          />
        </Form.Field>
        <Form.Field secondary label="Question for proposal contribution">
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={this._handleChange}
          />
        </Form.Field>
        <Form.Field secondary label="Axis description">
          <textarea
            name="proposal"
            value={formData.proposal}
            onChange={this._handleChange}
          />
        </Form.Field>
        <input type="submit" value="Save" onClick={this._handleSubmit} />
        <ReactTooltip id={tooltipId} aria-haspopup="true" effect="solid" />
      </ProposalContainer>
    );
  }
}

const Container = styled.div`
  margin-bottom: 2rem;
  .actions {
    text-align: right;
    .button {
      margin: 0;
    }
  }
`;

export default class ChatbotProposalsModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loadingActivation: false,
      proposals: {}
    };
  }
  componentDidMount() {
    this.fetch();
  }
  // componentDidUpdate(prevProps, prevState) {
  //   const { onChange } = this.props;
  //   const { proposals } = this.state;
  //   if (JSON.stringify(prevState.proposals) !== JSON.stringify(proposals)) {
  //     onChange && onChange({ proposals });
  //   }
  // }
  fetch = () => {
    const { campaign } = this.props;
    this.setState({ loading: true });
    Meteor.call(
      "chatbot.getProposals",
      { campaignId: campaign._id },
      (err, res) => {
        this.setState({ loading: false });
        if (err) {
          alertStore.add(err);
        } else {
          console.log(res);
          this.setState({
            proposals: res
          });
        }
      }
    );
  };
  getProposals = () => {
    const { proposals } = this.state;
    console.log(proposals);
    if (proposals.items && proposals.items.length) {
      return proposals.items;
    }
    return [{ title: "", proposal: "", question: "" }];
  };
  _handleProposalAdd = () => {
    const { proposals } = this.state;
    this.setState({
      proposals: {
        ...proposals,
        items: [...proposals.items, { title: "", proposal: "", question: "" }]
      }
    });
  };
  _handleProposalSubmit = (proposal, requestType) => {
    if (requestType == "insert") {
      const { proposals } = this.state;
      this.setState({
        proposals: {
          ...proposals,
          items: [...proposals.items.slice(0, -1), proposal]
        }
      });
    }
  };
  _canAddProposal = () => {
    const proposals = this.getProposals();
    return !proposals.filter(p => !p.id).length;
  };
  _isActive = () => {
    const { proposals } = this.state;
    return proposals && proposals.active;
  };
  _handlePrimary = proposalId => {
    const { campaign } = this.props;
    const { proposals } = this.state;
    if (proposals.primary_id == proposalId) proposalId = -1;
    Meteor.call(
      "chatbot.setPrimaryProposal",
      { campaignId: campaign._id, proposalId },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          this.setState({
            proposals: res
          });
        }
      }
    );
  };
  _handleRemove = proposalId => {
    const { proposals } = this.state;
    this.setState({
      proposals: {
        ...proposals,
        items: proposals.items.filter(p => p.id !== proposalId)
      }
    });
  };
  _handleActivationClick = () => {
    const { campaign } = this.props;
    this.setState({ loadingActivation: true });
    Meteor.call(
      "chatbot.proposalsActivation",
      {
        campaignId: campaign._id,
        active: !this._isActive()
      },
      (err, res) => {
        this.setState({ loadingActivation: false });
        if (err) {
          alertStore.add(err);
        } else {
          this.setState({
            proposals: res
          });
        }
      }
    );
  };
  render() {
    const { campaign, chatbot } = this.props;
    const { loading, loadingActivation, proposals } = this.state;
    const items = this.getProposals();
    if (loading) {
      return <Loading full />;
    }
    return (
      <Form onSubmit={ev => ev.preventDefault()}>
        <Form.Content>
          <Container>
            <ModuleStatus
              name="proposals"
              label="Present axes and receive proposals"
              chatbot={chatbot}
              campaign={campaign}
              onActivation={this._handleActivationClick}
              isActive={this._isActive()}
              loading={loadingActivation}
              onChange={this._handleChatbotChange}
            />
            {items.map((proposal, i) => (
              <Proposal
                key={proposal.yeeko_id || i}
                target={proposal.yeeko_id || i}
                campaignId={campaign._id}
                proposal={proposal}
                onPrimary={this._handlePrimary}
                isPrimary={proposals.primary_id == proposal.id}
                onRemove={this._handleRemove}
                onSubmit={this._handleProposalSubmit}
              />
            ))}
            {items.length < 8 ? (
              <div className="actions">
                <Button
                  secondary
                  small
                  onClick={this._handleProposalAdd}
                  disabled={!this._canAddProposal()}
                >
                  Add new axis
                </Button>
              </div>
            ) : null}
          </Container>
        </Form.Content>
      </Form>
    );
  }
}
