import React, { Component } from "react";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";

export default class CampaignSettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        campaignId: "",
        name: ""
      }
    };
  }
  static getDerivedStateFromProps({ campaign }, { formData }) {
    if (!campaign) {
      return {
        formData: {
          campaignId: "",
          name: ""
        }
      };
    } else if (campaign._id !== formData.campaignId) {
      return {
        formData: {
          campaignId: campaign._id,
          name: campaign.name
        }
      };
    }
    return null;
  }
  _filledForm = () => {
    const { formData } = this.state;
    return formData.campaignId && formData.name;
  };
  _handleChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value
      }
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    if (this._filledForm()) {
      const { formData } = this.state;
      Meteor.call("campaigns.update", formData, (err, data) => {
        if (!err) {
          console.log(err);
        } else {
          // data
        }
      });
    }
  };
  render() {
    const { active, formData } = this.state;
    return (
      <>
        <Nav />
        <Form onSubmit={this._handleSubmit}>
          <Form.Content>
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Nome da campanha"
              onChange={this._handleChange}
            />
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
              consectetur libero a fermentum malesuada. Proin pharetra ultricies
              eros, vel porta metus interdum eget. Sed maximus diam justo. Nunc
              vitae mattis nisl. Nunc efficitur, ipsum id iaculis sodales, ante
              nunc ullamcorper dui, ut ullamcorper enim turpis et sem.
              Suspendisse tempus porta purus, hendrerit pharetra sapien aliquet
              sed. Nulla vitae tellus ut ante convallis mollis a in tortor.
              Mauris porta, ante vel commodo convallis, lacus sem dignissim
              tellus, vitae venenatis arcu orci feugiat tortor. Nullam hendrerit
              ipsum felis, quis cursus est tincidunt vitae. Nulla et lacus
              iaculis, volutpat nunc a, finibus nunc. Ut suscipit mauris sed
              lacus rhoncus fermentum. Quisque fringilla, urna sit amet mollis
              laoreet, quam nunc placerat erat, suscipit vehicula ante velit ut
              urna. Praesent cursus justo ut nibh pretium, et tristique lectus
              volutpat.
            </p>
          </Form.Content>
          <Form.Actions>
            <input
              type="submit"
              disabled={!this._filledForm()}
              value="Atualizar campanha"
            />
          </Form.Actions>
        </Form>
      </>
    );
  }
}
