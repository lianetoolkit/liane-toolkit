import React from "react";
import { Form, Select } from "semantic-ui-react";
import { uniq } from "lodash";

export default class SkillField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      skillOptions: [
        "Design",
        "Vídeo",
        "Produção de eventos",
        "Redator",
        "Fotógrafo",
        "Mídias sociais",
        "Desenvolvimento Web",
        "Panfletagem"
      ]
    };
  }
  _updateOptions(options) {
    const { skillOptions } = this.state;
    if (Array.isArray(options) && options.length) {
      this.setState({
        skillOptions: uniq([
          ...skillOptions,
          ...uniq([...skillOptions, ...options])
        ])
      });
    }
  }
  componentDidMount() {
    const { value } = this.props;
    const { skillOptions } = this.state;
    this._updateOptions(value);
  }
  componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    const { skillOptions } = this.state;
    if (JSON.stringify(nextProps.value) != JSON.stringify(value)) {
      this._updateOptions(nextProps.value);
    }
  }
  render() {
    const { skillOptions } = this.state;
    return (
      <Form.Field
        name={this.props.name}
        control={Select}
        multiple
        search
        allowAdditions={true}
        label={this.props.label || "What can you do?"}
        value={this.props.value}
        onChange={this.props.onChange}
        onAddItem={(ev, data) => {
          this.setState({
            skillOptions: [...skillOptions, data.value]
          });
        }}
        fluid
        options={skillOptions.map(skill => {
          return {
            key: skill,
            value: skill,
            text: skill
          };
        })}
      />
    );
  }
}
