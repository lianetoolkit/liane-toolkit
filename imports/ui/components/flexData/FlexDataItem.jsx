import React from "react";
import { List, Table, Checkbox } from "semantic-ui-react";
import styled from "styled-components";

const Wrapper = styled.div`
  font-size: 1.2em;
  margin: 0 0 1.5rem;
  &:last-child {
    margin: 0;
  }
  .flex-data-label {
    margin-bottom: 0.5rem;
    letter-spacing: 0.1rem;
    display: block;
    font-size: 0.6em;
    color: #999;
    text-transform: uppercase;
  }
  .not-found {
    font-size: 0.9em;
    color: #666;
    font-style: italic;
  }
  &.group {
    > .flex-data-value {
      font-size: 0.8em;
      border: 1px solid #eee;
      padding: 1rem;
      .flex-data-item {
        margin: 0;
      }
    }
  }
  &.repeater {
    .table {
      font-size: 0.8em;
    }
    td > .flex-data-item {
      margin: 0;
    }
    td > .flex-data-item > .flex-data-label {
      display: none;
    }
    .group > .flex-data-value {
      padding: 0;
      border: 0;
    }
  }
`;

const GroupItem = ({ field, data }) => {
  return (
    <List>
      {field.fields.map(item => (
        <List.Item key={item.key}>
          <FlexDataItem field={item} data={{ value: data.value[item.key] }} />
        </List.Item>
      ))}
    </List>
  );
};

const RepeaterItem = ({ field, data }) => {
  return (
    <Table celled padded basic>
      <Table.Header>
        <Table.Row>
          {field.fields.map(fieldItem => (
            <Table.HeaderCell key={fieldItem.key}>
              {fieldItem.label}
            </Table.HeaderCell>
          ))}
        </Table.Row>
        {data.value.map((item, i) => (
          <Table.Row key={i}>
            {field.fields.map(fieldItem => (
              <Table.Cell key={fieldItem.key} verticalAlign="top">
                <FlexDataItem
                  field={fieldItem}
                  data={{ value: item[fieldItem.key] }}
                />
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Header>
    </Table>
  );
};

const BooleanItem = ({ field, data }) => {
  return <Checkbox disabled checked={!!data.value} />;
};

const LocationItem = ({ data }) => {
  data = data.value;
  let text = "";
  if (data.city) {
    text += data.city.name;
  }
  if (data.city && data.region) {
    text += ", ";
  }
  if (data.region) {
    text += data.region.name;
  }
  if (data.region && data.country) {
    text += " - ";
  }
  if (data.country) {
    text += data.country.name;
  }
  return <span>{text}</span>;
};

const KeyValWrapper = styled.div`
  p {
    margin: 0;
  }
`;

const KeyValItem = ({ data }) => {
  data = data.value;
  if (!data.length) {
    return <p className="not-found">Information not found</p>;
  }
  children = [];
  for (const item of data) {
    children.push(
      <p key={item.key}>
        <strong>{item.key}</strong>: {item.val}
      </p>
    );
  }
  return <KeyValWrapper>{children}</KeyValWrapper>;
};

export default class FlexDataItem extends React.Component {
  _value() {
    const { field, data } = this.props;
    if (data && (data.value !== undefined && data.value !== null)) {
      switch (field.fieldType) {
        case "date":
        case "textarea":
        case "text":
          return data.value;
        case "facebook_location":
          return <LocationItem data={data} />;
        case "select":
          return field.options[data.value];
        case "group":
          return <GroupItem field={field} data={data} />;
        case "repeater":
          return <RepeaterItem field={field} data={data} />;
        case "keyval":
          return <KeyValItem field={field} data={data} />;
        case "boolean":
          return <BooleanItem field={field} data={data} />;
        default:
          return null;
      }
    } else {
      return <span className="not-found">Information not found</span>;
    }
  }
  render() {
    const { field } = this.props;
    return (
      <Wrapper key={field.key} className={`flex-data-item ${field.fieldType}`}>
        <span className="flex-data-label">{field.label}</span>
        <div className="flex-data-value">{this._value()}</div>
      </Wrapper>
    );
  }
}
