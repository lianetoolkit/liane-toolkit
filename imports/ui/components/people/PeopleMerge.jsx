import React from "react";
import {
  Modal,
  Menu,
  Table,
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
import {
  pick,
  merge,
  compact,
  isEmpty,
  uniq,
  get,
  unset,
  setWith,
  clone
} from "lodash";
import { objDiff } from "/imports/ui/utils/utils.jsx";
import PeopleTable from "./PeopleTable.jsx";
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
      eligiblePeople: {},
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
  _handleMergeSelection = (ev, { value }) => {
    const { person } = this.props;
    const { people, eligiblePeople } = this.state;
    let newPeople = [...people];
    let pulled = false;
    people.forEach((p, i) => {
      if (p._id == value) {
        newPeople.splice(i, 1);
        pulled = true;
      }
    });
    if (!pulled) {
      for (var key in eligiblePeople) {
        eligiblePeople[key].forEach(p => {
          if (p._id == value) {
            newPeople.push(p);
          }
        });
      }
    }
    if (compact(uniq(newPeople.map(p => p && p.facebookId))).length > 1) {
      alert(
        "You cannot select people from two different existing Facebook references"
      );
    } else {
      // Merge with selected
      let merged = {};
      merge(merged, ...newPeople, person);
      // Keep original id
      merged._id = person._id;
      this.setState({
        people: newPeople,
        merged,
        options: this._buildOptions([person, ...newPeople], merged),
        diff: this._getDiff(person, merged)
      });
    }
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaignId, person, onSubmit } = this.props;
    const { merged, removeDuplicates, people } = this.state;
    Meteor.call(
      "people.merge",
      {
        personId: merged._id,
        merged,
        from: people.map(p => p._id),
        remove: true // always remove duplicates
      },
      (err, res) => {
        if (err) {
          Alerts.error(err.message);
        } else {
          Alerts.success(`${person.name} merged successfully.`);
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
  _eligibleNavLabel(key) {
    switch (key) {
      case "same":
        return "Same facebook reference";
      case "none":
        return "No facebook reference found";
      default:
        return "Facebook reference: " + key;
    }
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
      if (!has && this._hasDiff(field.key)) has = true;
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
      { personId: person._id },
      (err, people) => {
        if (err) {
          this.setState({
            loading: false
          });
          Alerts.error(err.message);
        } else {
          this.setState({
            loading: false,
            eligiblePeople: people,
            eligibleNav: Object.keys(people)[0]
          });
        }
      }
    );
  }
  render() {
    const { person } = this.props;
    const {
      open,
      loading,
      eligiblePeople,
      eligibleNav,
      people,
      options,
      merged
    } = this.state;
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
          {!loading && isEmpty(eligiblePeople) ? (
            <p>No match was found for merging</p>
          ) : null}
          {!loading && !isEmpty(eligiblePeople) ? (
            <Form onSubmit={this._handleSubmit}>
              {Object.keys(eligiblePeople).length > 1 ? (
                <>
                  <p>
                    Navigate below between different references found and select
                    which people you'd like to merge.
                  </p>
                  <Menu>
                    {Object.keys(eligiblePeople).map(key => (
                      <Menu.Item
                        key={key}
                        active={key == eligibleNav}
                        onClick={() => this.setState({ eligibleNav: key })}
                      >
                        {this._eligibleNavLabel(key)}
                      </Menu.Item>
                    ))}
                  </Menu>
                </>
              ) : (
                <p>
                  We found eligible people for merge, select below which you'd
                  like to merge.
                </p>
              )}
              <PeopleTable
                people={eligiblePeople[eligibleNav]}
                extraCells={person => (
                  <>
                    <Table.Cell />
                    <Table.Cell collapsing>
                      <Checkbox
                        label="Select for merge"
                        value={person._id}
                        onChange={this._handleMergeSelection}
                        checked={!!people.find(p => p._id == person._id)}
                      />
                    </Table.Cell>
                  </>
                )}
              />
              {people.length ? (
                <>
                  <p>
                    Selected for merging:{" "}
                    <Label as="span">{people.length}</Label>
                  </p>
                  {this._hasDiffs() ? (
                    <>
                      <p>
                        Some fields have different values, which must be
                        manually resolved.
                      </p>
                      <p>
                        Select below the fields to replace or add, or select
                        "Skip" to not change its value.
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
                                    <Label size="tiny">
                                      Has existing value
                                    </Label>
                                  )}
                                </Header>
                                <Form.Group key={field.key}>
                                  {options[field.key].map((option, i) => (
                                    <Form.Field
                                      key={`${field.key}-${i}`}
                                      name={field.key}
                                      control={Radio}
                                      label={this._label(
                                        option.value,
                                        field.key
                                      )}
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
                    <p>
                      No manual resolution needed, able to automatically merge.
                    </p>
                  )}
                  {/* <Message negative>
                    <Form.Field
                      control={Checkbox}
                      label="Delete other occurrences. This is not recoverable."
                      onChange={this._handleDeleteChange}
                      name="deleteDuplicates"
                    />
                  </Message> */}
                  <Button primary fluid>
                    Merge {person.name}
                  </Button>
                </>
              ) : null}
            </Form>
          ) : null}
        </Modal.Content>
      </Modal>
    );
  }
}
