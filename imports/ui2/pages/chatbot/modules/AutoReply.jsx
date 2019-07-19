import React, { Component } from "react";
import styled, { css } from "styled-components";
import ReactTooltip from "react-tooltip";
import CreatableSelect from "react-select/lib/Creatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

import Form from "/imports/ui2/components/Form.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
import ToggleCheckbox from "/imports/ui2/components/ToggleCheckbox.jsx";

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
`;

class ReplyInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wordsOptions: []
    };
  }
  _handleChange = ({ target }) => {
    const { value, onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange({
        ...value,
        [target.name]: target.type == "checkbox" ? target.checked : target.value
      });
    }
  };
  _handleWordsChange = words => {
    const { value, onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange({
        ...value,
        words: words.map(item => item.value)
      });
    }
  };
  _handleRemoveClick = () => {
    const { onRemove } = this.props;
    if (onRemove && typeof onRemove == "function") {
      onRemove();
    }
  };
  _handleWordCreate = label => {
    const { value, onChange } = this.props;
    this.setState({
      wordsOptions: [label, ...this.state.wordsOptions]
    });
    if (onChange && typeof onChange == "function") {
      onChange({
        ...value,
        words: [...(get(value, "words") || []), label]
      });
    }
  };
  _getWordsValue = () => {
    const { value } = this.props;
    if (!value.words || !value.words.length) {
      return [];
    }
    return value.words.map(word => {
      return { value: word, label: word };
    });
  };
  render() {
    const { value, target, isPrimary } = this.props;
    const { wordsOptions } = this.state;
    const tooltipId = `proposal-input-${target}`;
    return (
      <ProposalInputContainer>
        <div className="actions">
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
        <ToggleCheckbox
          secondary
          name="active"
          onChange={this._handleChange}
          checked={value.active}
        >
          Ativo
        </ToggleCheckbox>
        <Form.Field label="Lista de palavras para identificar resposta">
          <CreatableSelect
            classNamePrefix="select-search"
            cacheOptions
            isMulti
            placeholder="Palavras..."
            options={wordsOptions}
            name="words"
            onCreateOption={this._handleWordCreate}
            onChange={this._handleWordsChange}
            value={this._getWordsValue()}
          />
        </Form.Field>
        <Form.Field secondary label="Resposta automática">
          <textarea
            name="reply"
            value={value.reply}
            onChange={this._handleChange}
          />
        </Form.Field>
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

export default class ChatbotAutoReplyModule extends Component {
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
  getValue = path => {
    const { formData } = this.state;
    return get(formData, path);
  };
  getReplyItem = () => {
    return { words: [], reply: "", active: true };
  };
  getReplies = () => {
    const { formData } = this.state;
    let replies = get(formData, "extra_info.auto_reply.items");
    if (!replies || !replies.length) {
      return [this.getReplyItem()];
    }
    return replies;
  };
  _handleReplyChange = index => reply => {
    const { formData } = this.state;
    let newFormData = { ...formData };
    set(newFormData, `extra_info.auto_reply.items[${index}]`, reply);
    this.setState({
      formData: newFormData
    });
  };
  _handleReplyRemove = index => () => {
    const { formData } = this.state;
    let newFormData = { ...formData };
    newFormData.extra_info.auto_reply.items.splice(index, 1);
    this.setState({
      formData: newFormData
    });
  };
  _handleReplyAdd = () => {
    const { formData } = this.state;
    let newFormData = { ...formData };
    const items = get(newFormData, "extra_info.auto_reply.items");
    let index = 1;
    if (items && items.length) {
      index = items.length;
    }
    set(
      newFormData,
      `extra_info.auto_reply.items[${index}]`,
      this.getReplyItem()
    );
    this.setState({ formData: newFormData });
  };
  _handleChatbotChange = data => {
    const { onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange(data);
    }
  };
  _canAddReply = () => {
    const { formData } = this.state;
    return !!get(formData, "extra_info.auto_reply.items");
  };
  render() {
    const { campaign, chatbot } = this.props;
    const { loading, formData } = this.state;
    const replies = this.getReplies();
    if (loading) {
      return <Loading full />;
    }
    return (
      <Form onSubmit={ev => ev.preventDefault()}>
        <Form.Content>
          <Container>
            <ModuleStatus
              name="auto_reply"
              label="Respostas automáticas"
              chatbot={chatbot}
              campaign={campaign}
              onChange={this._handleChatbotChange}
            />
            {replies.map((reply, i) => (
              <ReplyInput
                key={i}
                onChange={this._handleReplyChange(i)}
                onRemove={this._handleReplyRemove(i)}
                value={reply}
                target={i}
              />
            ))}
            <div className="actions">
              <Button
                secondary
                small
                onClick={this._handleReplyAdd}
                disabled={!this._canAddReply()}
              >
                Adicionar nova resposta automática
              </Button>
            </div>
          </Container>
        </Form.Content>
        <Form.Actions>
          <input
            type="submit"
            value="Atualizar configurações"
            onClick={this._handleSubmit}
          />
        </Form.Actions>
      </Form>
    );
  }
}
