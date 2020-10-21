import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled, { css } from "styled-components";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import CountrySelect from "./CountrySelect.jsx";
import RegionSelect from "./RegionSelect.jsx";
import Form from "./Form.jsx";

const messages = defineMessages({
  countryLabel: {
    id: "app.address.country.label",
    defaultMessage: "Country",
  },
  zipcodeLabel: {
    id: "app.address.zipcode.label",
    defaultMessage: "Zipcode",
  },
  zipcodePlaceholder: {
    id: "app.address.zipcode.placeholder",
    defaultMessage: "Type a zipcode",
  },
  regionLabel: {
    id: "app.address.region.label",
    defaultMessage: "Region",
  },
  cityLabel: {
    id: "app.address.city.label",
    defaultMessage: "City",
  },
  neighbourhoodLabel: {
    id: "app.address.neighbourhood.label",
    defaultMessage: "Neighbourhood",
  },
  streetAddressLabel: {
    id: "app.address.street_address.label",
    defaultMessage: "Street address",
  },
  numberLabel: {
    id: "app.address.number.label",
    defaultMessage: "Number",
  },
  complementLabel: {
    id: "app.address.complement.label",
    defaultMessage: "Complement",
  },
});

const Container = styled.div``;

const Group = styled.div`
  display: flex;
  margin-left: -1rem;
  margin-right: -1rem;
  > label {
    margin-left: 1rem;
    margin-right: 1rem;
    flex: 1 1 0;
    &.grow {
      flex: 2 1 0;
    }
  }
  ${(props) =>
    props.secondary &&
    css`
      font-size: 0.9em;
    `}
  @media (max-width: 620px) {
    padding: 1rem;
    flex-wrap: wrap;
    > label {
      flex: 1 1 100%;
      margin-left: 0;
      margin-right: 0;
    }
  }
`;

class AddressField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
    };
  }
  componentDidMount() {
    const { value, country } = this.props;
    let formData = {};
    if (value) {
      formData = {
        ...formData,
        ...value,
      };
    }
    if (value) {
      this.setState({ formData });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { country, onChange, name } = this.props;
    const { formData } = this.state;
    let value = { ...formData };
    if (!value.country) value.country = country;
    if (
      onChange &&
      JSON.stringify(prevState.formData) != JSON.stringify(formData)
    ) {
      onChange({ name, value });
    }
  }
  _updateFromZipcodeData = _.debounce((country, zipcode) => {
    const { formData } = this.state;
    Meteor.call(
      "people.resolveZipcode",
      {
        country,
        zipcode,
      },
      (err, res) => {
        if (res) {
          this.setState({
            formData: {
              ...formData,
              region: res.state,
              city: res.city,
              neighbourhood: res.neighborhood,
              street: res.street,
            },
          });
        }
      }
    );
  }, 200);
  _handleZipcodeChange = ({ target }) => {
    const { country } = this.props;
    const { formData } = this.state;
    const zipcode = target.value;
    this.setState({
      formData: {
        ...formData,
        zipcode,
      },
    });
    this._updateFromZipcodeData(formData.country || country, zipcode);
  };
  _handleChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value,
      },
    });
  };
  render() {
    const { intl, country } = this.props;
    const { formData } = this.state;
    return (
      <Container>
        <Group>
          <Form.Field label={intl.formatMessage(messages.countryLabel)}>
            <CountrySelect
              label={intl.formatMessage(messages.countryLabel)}
              value={formData.country || country}
              name="country"
              onChange={this._handleChange}
            />
          </Form.Field>
          {formData.country || country ? (
            <Form.Field label={intl.formatMessage(messages.zipcodeLabel)}>
              <input
                type="text"
                name="zipcode"
                placeholder={intl.formatMessage(messages.zipcodePlaceholder)}
                value={formData.zipcode}
                onChange={this._handleZipcodeChange}
              />
            </Form.Field>
          ) : null}
        </Group>
        {formData.country || country ? (
          <>
            <Group secondary>
              <Form.Field label={intl.formatMessage(messages.regionLabel)}>
                <RegionSelect
                  country={formData.country || country}
                  name="region"
                  onChange={this._handleChange}
                  value={formData.region}
                />
              </Form.Field>
              <Form.Field label={intl.formatMessage(messages.cityLabel)}>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(messages.neighbourhoodLabel)}
              >
                <input
                  type="text"
                  name="neighbourhood"
                  value={formData.neighbourhood}
                  onChange={this._handleChange}
                />
              </Form.Field>
            </Group>
            <Group secondary>
              <Form.Field
                label={intl.formatMessage(messages.streetAddressLabel)}
                className="grow"
              >
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label={intl.formatMessage(messages.numberLabel)}>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field label={intl.formatMessage(messages.complementLabel)}>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement}
                  onChange={this._handleChange}
                />
              </Form.Field>
            </Group>
          </>
        ) : null}
      </Container>
    );
  }
}

AddressField.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(AddressField);
