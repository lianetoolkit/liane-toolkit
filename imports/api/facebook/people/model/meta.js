import { genderOptions, personFields } from "./common";

export default [
  {
    key: "basic_info",
    title: "Basic information",
    fields: [
      {
        key: "age",
        label: "Age",
        fieldType: "text"
      },
      {
        key: "gender",
        label: "Gender",
        fieldType: "select",
        options: genderOptions
      },
      {
        key: "location",
        label: "Location",
        fieldType: "facebook_location"
      },
      {
        key: "occupation",
        label: "Job/Education",
        fieldType: "text"
      }
    ]
  },
  {
    key: "social_networks",
    title: "Social networks",
    fields: [
      {
        key: "twitter",
        label: "Twitter",
        fieldType: "text"
      },
      {
        key: "instagram",
        label: "Instagram",
        fieldType: "text"
      }
    ]
  },
  {
    key: "contact",
    title: "Contact information",
    fields: [
      {
        key: "email",
        label: "Email",
        fieldType: "text"
      },
      {
        key: "cellphone",
        label: "Cellphone number",
        fieldType: "text"
      },
      {
        key: "telephone",
        label: "Telephone number",
        fieldType: "text"
      }
    ]
  },
  {
    key: "extra",
    title: "Extra fields",
    fields: [
      {
        key: "extra",
        label: "Extra fields",
        fieldType: "keyval"
      }
    ]
  }
];
