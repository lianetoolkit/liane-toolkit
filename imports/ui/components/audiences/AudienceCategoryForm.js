import React, { Component } from 'react';
import { Form, Statistic, Grid, Button, Select } from "semantic-ui-react";

const initialCategory = {
  title: 'Education',
  targetingSpec: {
    interests: ['123', '432']
  }
}

const availableTypes = {
  'age_min': 'Minimum age',
  'age_max': 'Maximum age',
  'behaviours': 'Behaviours',
  'device_platforms': 'Device platforms',
  'genders': 'Genders',
  // 'geo_locations': 'Locations',
  'interests': 'Interests',
  'publisher_platforms': 'Publisher platforms'
}

class EditAudienceCategory extends Component {
  constructor (props) {
    super(props);
    this.state = {
      category: Object.assign({}, initialCategory)
    };
    this.availableKeys = Object.keys(availableTypes);
  }
  getCategory (id) {
    this.service.get(id).then(data => {
      this.setState({
        category: data
      });
    });
  }
  newSpecLine (type) {
    return (ev) => {
      ev.preventDefault();
      const { category } = this.state;
      // New line
      category.targetingSpec[type] = '';
      this.setState({
        category: Object.assign({}, category)
      });
    }
  }
  componentDidUpdate () {
  }
  componentWillReceivesProps (nextProps) {
   if(nextProps.id !== this.props.id) {
     if(nextProps.id) {
       this.getCategory(nextProps.id);
     } else {
       this.setState({
         category: Object.assign({}, initialCategory)
       });
     }
   }
  }
  render () {
    const { onSubmit, contexts } = this.props;
    const { category } = this.state;
    const keys = Object.keys(category.targetingSpec);
    return (
      <Form onSubmit={onSubmit}>
        <Form.input type="text" name="title" placeholder="Title" />

        <table>
          <tbody>
            {keys.map((key, i) => (
              <tr key={`spec-${key}`}>
                <td>{key}</td>
                <td><input type="text" name={`targetingSpec[${key}]`} value={category.targetingSpec[key]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {this.availableKeys.map((key, i) => !category.targetingSpec.hasOwnProperty(key) ? (
          <Button key={i} onClick={this.newSpecLine(key)}>Add {availableTypes[key]}</Button>
        ) : null)}
        <Button>Send</Button>
      </Form>
    )
  }
}

export default EditAudienceCategory;
