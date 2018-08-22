import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";

import { Form, TextArea, Button } from "semantic-ui-react";

export default class OptionsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }
  componentDidMount() {
    const { options } = this.props;
    this._updateOptions(options);
  }
  componentWillReceiveProps(nextProps) {
    const { options } = this.props;
    if (JSON.stringify(options) !== JSON.stringify(nextProps.options)) {
      this._updateOptions(nextProps.options);
    }
  }
  _updateOptions = options => {
    if (options && options.length) {
      let formData = {};
      options.forEach(option => {
        formData[option.name] = option.value;
      });
      this.setState({
        formData: {
          ...this.state.formData,
          ...formData
        }
      });
    }
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { formData } = this.state;
    let data = [];
    for (let name in formData) {
      data.push({
        name,
        value: formData[name]
      });
    }
    Meteor.call("options.upsertMany", { data }, (err, res) => {
      if (err) {
        Alerts.error(err);
      } else {
        Alerts.success("Options saved successfully");
      }
    });
  };
  _handleChange = (ev, { name, value }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value
      }
    });
  };
  render() {
    const { options, loading } = this.props;
    const { formData } = this.state;
    return (
      <div>
        <PageHeader title="Site Options" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Form onSubmit={this._handleSubmit}>
              <Form.Field
                name="privacy_policy"
                control={TextArea}
                onChange={this._handleChange}
                label="Privacy Policy"
                rows="15"
                value={formData.privacy_policy}
              />
              <Button primary>Save changes</Button>
            </Form>
          )}
        </section>
      </div>
    );
  }
}
