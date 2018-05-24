import React from "react";
import {
  Modal,
  Dimmer,
  Divider,
  Loader,
  Form,
  Button,
  Icon,
  Header,
  Segment,
  Radio,
  Label,
  Checkbox,
  Message
} from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import { pick, merge, isEmpty, get, unset, setWith, clone } from "lodash";
import { objDiff } from "/imports/ui/utils/utils.jsx";
import peopleMetaModel from "/imports/api/facebook/people/model/meta";

let mergeFields = [
  {
    key: "name",
    title: "Name"
  }
];

for (const section of peopleMetaModel) {
  for (const field of section.fields) {
    mergeFields.push({
      key: `campaignMeta.${section.key}.${field.key}`,
      title: field.label
    });
  }
}

export default class PeopleMerge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      loading: false,
      people: [],
      merged: null,
      options: {},
      diff: {},
      removeDuplicates: false
    };
    this._handleModalOpen = this._handleModalOpen.bind(this);
  }
  _handleChange = (ev, { name, value }) => {
    let newMerged = Object.assign({}, this.state.merged);
    if (value === "") {
      unset(newMerged, name);
    } else {
      newMerged = setWith(clone(newMerged), name, value, clone);
    }
    this.setState({
      merged: newMerged
    });
  };
  _handleDeleteChange = (ev, { checked }) => {
    const { people } = this.state;
    this.setState({
      removeDuplicates: checked
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaignId, onSubmit } = this.props;
    const { merged, removeDuplicates, people } = this.state;
    Meteor.call(
      "people.merge",
      {
        campaignId,
        person: merged,
        from: people.map(p => p._id),
        remove: removeDuplicates
      },
      (err, res) => {
        if (err) {
          Alerts.error(err.message);
        } else {
          Alerts.success(`${merged.name} merged successfully.`);
          this.setState({
            open: false
          });
          if (onSubmit) onSubmit(merged._id);
        }
      }
    );
  };
  _getColor() {
    const { duplicates, person } = this.props;
    const match = duplicates.find(p => p.name == person.name);
    if (match && match.count > 1) {
      return match.color;
    } else {
      return "transparent";
    }
  }
  _get(person, key) {
    let val = false;
    switch (key) {
      case "campaignMeta.basic_info.location":
        const location = get(person, key);
        if (
          location &&
          (!isEmpty(location.region) || !isEmpty(location.city))
        ) {
          val = get(person, key);
        }
        break;
      default:
        val = get(person, key);
    }
    return val;
  }
  _label(value, key) {
    const { person } = this.props;
    let label;
    switch (key) {
      case "campaignMeta.basic_info.location":
        label = value.city.name + " - " + value.region.name;
        break;
      default:
        label = value;
    }
    if (get(person, key) == value) {
      label += " (current)";
    }
    return label;
  }
  _buildOptions(people, merged) {
    let res = {};
    for (const person of people) {
      for (const field of mergeFields) {
        const mergedVal = this._get(merged, field.key);
        const personVal = this._get(person, field.key);
        if (!res[field.key]) res[field.key] = [];
        if (
          personVal &&
          !res[field.key].find(
            d => JSON.stringify(d.value) == JSON.stringify(personVal)
          )
        ) {
          res[field.key].push({
            origin: person._id,
            value: personVal
          });
        }
      }
    }
    return res;
  }
  _hasDiffs() {
    let has = false;
    for (const field of mergeFields) {
      if (this._hasDiff(field.key)) has = true;
    }
    return has;
  }
  _hasDiff(key) {
    const { options, diff } = this.state;
    return !!(options[key].length > 1 || this._get(diff, key));
  }
  _getDiff(person, merged) {
    const keys = mergeFields.map(f => f.key);
    const pickedMerged = pick(merged, keys);
    const pickedPerson = pick(person, keys);
    const diff = objDiff(pickedMerged, pickedPerson);
    return diff;
  }
  _handleModalOpen() {
    const { campaignId, person } = this.props;
    this.setState({ open: true, loading: true });
    Meteor.call(
      "people.findDuplicates",
      { campaignId, personId: person._id },
      (err, people) => {
        let merged = {};
        merge(merged, ...people, person);
        // Keep original id
        merged._id = person._id;
        this.setState({
          loading: false,
          people,
          merged,
          options: this._buildOptions([person, ...people], merged),
          diff: this._getDiff(person, merged)
        });
      }
    );
  }
  render() {
    const { person } = this.props;
    const { open, loading, people, options, merged } = this.state;
    return (
      <Modal
        open={open}
        onClose={() => {
          this.setState({ open: false });
        }}
        onOpen={this._handleModalOpen}
        trigger={
          <a href="javascript:void(0)">
            <Icon name="warning sign" style={{ color: this._getColor() }} />{" "}
            Merge options
          </a>
        }
      >
        <Modal.Header>Merging {person.name}</Modal.Header>
        <Modal.Content>
          <Dimmer active={loading} inverted>
            <Loader />
          </Dimmer>
          {!loading && !people.length ? (
            <p>No match was found for merging</p>
          ) : null}
          {!loading && people.length ? (
            <Form onSubmit={this._handleSubmit}>
              <p>Found {people.length} matches for merging.</p>
              <Divider />
              {this._hasDiffs() ? (
                <>
                  <p>
                    Some fields have different values, which must be manually
                    resolved.
                  </p>
                  <p>
                    Select below the fields to replace or add, or select "Skip"
                    to not change its value.
                  </p>
                  <Segment.Group size="tiny">
                    {mergeFields.map(
                      field =>
                        this._hasDiff(field.key) ? (
                          <Segment key={field.key}>
                            <Header size="tiny">
                              {field.title}
                              {!this._get(person, field.key) ? (
                                <Label color="green" size="tiny">
                                  New value
                                </Label>
                              ) : (
                                <Label size="tiny">Has existing value</Label>
                              )}
                            </Header>
                            <Form.Group key={field.key}>
                              {options[field.key].map((option, i) => (
                                <Form.Field
                                  key={`${field.key}-${i}`}
                                  name={field.key}
                                  control={Radio}
                                  label={this._label(option.value, field.key)}
                                  value={option.value}
                                  checked={
                                    get(merged, field.key) == option.value
                                  }
                                  onChange={this._handleChange}
                                />
                              ))}
                              <Form.Field
                                name={field.key}
                                control={Radio}
                                label="Skip"
                                value=""
                                checked={!get(merged, field.key)}
                                onChange={this._handleChange}
                              />
                            </Form.Group>
                          </Segment>
                        ) : null
                    )}
                  </Segment.Group>
                </>
              ) : (
                <p>No manual resolution needed, able to automatically merge.</p>
              )}
              <Message negative>
                <Form.Field
                  control={Checkbox}
                  label="Delete other occurrences. This is not recoverable."
                  onChange={this._handleDeleteChange}
                  name="deleteDuplicates"
                />
              </Message>
              <Button primary fluid>
                Merge {person.name}
              </Button>
            </Form>
          ) : null}
        </Modal.Content>
      </Modal>
    );
  }
}
