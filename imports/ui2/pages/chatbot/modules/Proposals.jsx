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

const ProposalInputContainer = styled.div`
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

class ProposalInput extends Component {
  _handleChange = ({ target }) => {
    const { value, onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange({
        ...value,
        [target.name]: target.value
      });
    }
  };
  _handleRemoveClick = () => {
    const { onRemove } = this.props;
    if (confirm("Você tem certeza?")) {
      if (onRemove && typeof onRemove == "function") {
        onRemove();
      }
    }
  };
  _handlePrimaryClick = () => {
    const { onPrimary } = this.props;
    if (onPrimary && typeof onPrimary == "function") {
      onPrimary();
    }
  };
  render() {
    const { value, target, isPrimary } = this.props;
    const tooltipId = `proposal-input-${target}`;
    return (
      <ProposalInputContainer>
        <div className="actions">
          <a
            href="javascript:void(0);"
            onClick={this._handlePrimaryClick}
            className={isPrimary ? "active" : ""}
            data-tip={isPrimary ? "Remover como principal" : "Tornar principal"}
            data-for={tooltipId}
          >
            <FontAwesomeIcon icon="star" />
          </a>
          <a
            href="javascript:void(0);"
            onClick={this._handleRemoveClick}
            className="remove"
            data-tip={"Remover"}
            data-for={tooltipId}
          >
            <FontAwesomeIcon icon="times" />
          </a>
        </div>
        <Form.Field label="Título da proposta">
          <input
            type="text"
            name="title"
            value={value.title}
            onChange={this._handleChange}
          />
        </Form.Field>
        <Form.Field secondary label="Pergunta para contribuição na proposta">
          <input
            type="text"
            name="question"
            value={value.question}
            onChange={this._handleChange}
          />
        </Form.Field>
        <Form.Field secondary label="Descrição da proposta">
          <textarea
            name="description"
            value={value.description}
            onChange={this._handleChange}
          />
        </Form.Field>
        <input type="submit" value="Salvar proposta" />
        <ReactTooltip id={tooltipId} aria-haspopup="true" effect="solid" />
      </ProposalInputContainer>
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
      formData: {}
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (JSON.stringify(state.formData) != JSON.stringify(props.chatbot)) {
      return {
        formData: props.chatbot
      };
    }
    return null;
  }
  _handleChange = ({ target }) => {
    const { formData } = this.state;
    let newFormData = { ...formData };
    set(
      newFormData,
      target.name,
      target.type == "checkbox" ? target.checked : target.value
    );
    this.setState({
      formData: newFormData
    });
  };
  _handleProposalChange = index => proposal => {
    const { formData } = this.state;
    let newFormData = { ...formData };
    set(newFormData, `extra_info.proposals.items[${index}]`, proposal);
    this.setState({
      formData: newFormData
    });
  };
  _handleProposalRemove = index => () => {
    const { formData } = this.state;
    let newFormData = { ...formData };
    newFormData.extra_info.proposals.items.splice(index, 1);
    const primary = this._getPrimary();
    let newPrimary;
    if (primary > index) {
      newPrimary = Math.max(primary - 1, 0);
    } else if (primary == index) {
      newPrimary = -1;
    }
    if (!isNaN(newPrimary)) {
      set(newFormData, "extra_info.proposals.primary", newPrimary);
    }
    this.setState({
      formData: newFormData
    });
  };
  _handleProposalPrimary = index => () => {
    const { formData } = this.state;
    let newFormData = { ...formData };
    const primary = this._getPrimary();
    set(
      newFormData,
      `extra_info.proposals.primary`,
      primary == index ? -1 : index
    );
    this.setState({
      formData: newFormData
    });
  };
  _handleProposalAdd = () => {
    const { formData } = this.state;
    let newFormData = { ...formData };
    const items = get(newFormData, "extra_info.proposals.items");
    let index = 1;
    if (items && items.length) {
      index = items.length;
    }
    set(
      newFormData,
      `extra_info.proposals.items[${index}]`,
      this.getProposalItem()
    );
    this.setState({ formData: newFormData });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaign } = this.props;
    const { formData } = this.state;
    this.setState({
      loading: true
    });
    Meteor.call(
      "chatbot.update",
      {
        campaignId: campaign._id,
        config: formData
      },
      (err, res) => {
        this.setState({
          loading: false
        });
        if (err) {
          alertStore.add(err);
        } else {
          this.setState({
            formData: res.config
          });
          alertStore.add("Atualizado", "success");
          this._handleChatbotChange(res.config);
        }
      }
    );
  };
  getProposalItem = () => {
    return { title: "", description: "", question: "" };
  };
  getProposals = () => {
    const { formData } = this.state;
    let proposals = get(formData, "extra_info.proposals.items");
    if (!proposals || !proposals.length) {
      return [this.getProposalItem()];
    }
    return proposals;
  };
  _getPrimary = () => {
    const { formData } = this.state;
    return get(formData, "extra_info.proposals.primary") || 0;
  };
  _isPrimary = index => {
    const { formData } = this.state;
    const primary = get(formData, "extra_info.proposals.primary") || 0;
    return index == primary;
  };
  _canAddProposal = () => {
    const { formData } = this.state;
    return !!get(formData, "extra_info.proposals.items");
  };
  getValue = path => {
    const { formData } = this.state;
    return get(formData, path);
  };
  _handleChatbotChange = data => {
    const { onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange(data);
    }
  };
  render() {
    const { campaign, chatbot } = this.props;
    const { loading, formData } = this.state;
    const proposals = this.getProposals();
    if (loading) {
      return <Loading full />;
    }
    return (
      <Form onSubmit={ev => ev.preventDefault()}>
        <Form.Content>
          <Container>
            <ModuleStatus
              name="proposals"
              label="Apresentar e receber propostas"
              chatbot={chatbot}
              campaign={campaign}
              onChange={this._handleChatbotChange}
            />
            {proposals.map((proposal, i) => (
              <ProposalInput
                key={i}
                onChange={this._handleProposalChange(i)}
                onRemove={this._handleProposalRemove(i)}
                onPrimary={this._handleProposalPrimary(i)}
                value={proposal}
                isPrimary={this._isPrimary(i)}
                target={i}
              />
            ))}
            <div className="actions">
              <Button
                secondary
                small
                onClick={this._handleProposalAdd}
                disabled={!this._canAddProposal()}
              >
                Adicionar nova proposta
              </Button>
            </div>
          </Container>
        </Form.Content>
      </Form>
    );
  }
}
