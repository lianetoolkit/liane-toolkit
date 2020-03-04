import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import styled from "styled-components";
import {
  FEATURES,
  PERMISSIONS,
  FEATURE_PERMISSION_MAP
} from "/imports/utils/campaignPermissions";

let featuresLabels = {};
for (feature of FEATURES) {
  featuresLabels[feature] = {
    id: `app.campaign.team.permission.label.${feature}`,
    defaultMessage: feature
  };
}
featuresLabels = defineMessages(featuresLabels);

let permissionsLabels = {};
for (feature of FEATURES) {
  for (permission in PERMISSIONS) {
    if (FEATURE_PERMISSION_MAP[feature] & PERMISSIONS[permission]) {
      permissionsLabels[`${feature}.${permission}`] = {
        id: `app.campaign.team.permission.label.${feature}.${permission}`,
        defaultMessage: permission
      };
    }
  }
}
permissionsLabels = defineMessages(permissionsLabels);

const Container = styled.div`
  display: flex;
  width: 100%;
  font-size: 0.7em;
  h3 {
    border: 0;
    margin: 0 0 1rem;
    padding: 0;
    font-family: inherit;
    font-weight: 600;
    color: #333;
  }
  label.permission-item {
    font-weight: normal;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    input {
      margin-right: 0.5rem;
    }
  }
  > div {
    flex: 1 1 0;
    padding: 0.5rem 1rem;
    border-right: 1px solid #e5e5e5;
    &:last-child {
      border-right: 0;
    }
  }
`;

class PermissionsField extends Component {
  constructor(props) {
    super(props);
    let defaultValue = {};
    for (feature of FEATURES) {
      defaultValue[feature] = 0;
    }
    this.state = {
      value: defaultValue
    };
  }
  componentDidMount() {
    const { value } = this.props;
    if (value) {
      this.setState({ value });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { name, onChange } = this.props;
    const { value } = this.state;
    if (JSON.stringify(prevState.value) != JSON.stringify(value)) {
      onChange && onChange({ target: { name, value } });
    }
  }
  _handleChange = (feature, permission) => ev => {
    const { value } = this.state;
    let newValue = { ...value };
    if (ev.target.checked) {
      newValue[feature] = newValue[feature] + PERMISSIONS[permission];
    } else {
      newValue[feature] = newValue[feature] - PERMISSIONS[permission];
    }
    this.setState({
      value: newValue
    });
  };
  _permissionItem = (feature, permission) => {
    const { intl } = this.props;
    const { value } = this.state;
    if (FEATURE_PERMISSION_MAP[feature] & PERMISSIONS[permission]) {
      return (
        <label key={`${feature}-${permission}`} className="permission-item">
          <input
            type="checkbox"
            value={PERMISSIONS[permission]}
            onChange={this._handleChange(feature, permission)}
            checked={value[feature] & PERMISSIONS[permission]}
          />
          {intl.formatMessage(permissionsLabels[`${feature}.${permission}`])}
        </label>
      );
    }
    return null;
  };
  render() {
    const { intl } = this.props;
    return (
      <Container>
        {FEATURES.map(feature => (
          <div>
            <h3>{intl.formatMessage(featuresLabels[feature])}</h3>
            {Object.keys(PERMISSIONS).map(permission =>
              this._permissionItem(feature, permission)
            )}
          </div>
        ))}
      </Container>
    );
  }
}

PermissionsField.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(PermissionsField);
