import { genderOptions, educationOptions, personFields } from "./common";

export default [
  {
    key: "basic_info",
    title: "Basic information",
    description: "Empecemos con algunas informaciones básicas de la candidata",
    fields: [
      {
        key: "name_bb",
        label: "Your name in the ballot box",
        fieldType: "text"
      },
      {
        key: "party_name",
        label: "Name of your party",
        fieldType: "text"
      },
      {
        key: "number",
        label: "Your number",
        fieldType: "text"
      },
      {
        key: "age",
        label: "Your age",
        fieldType: "text"
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
      },
      {
        key: "social_networks",
        label: "Your social networks",
        fieldType: "group",
        fields: [
          {
            key: "twitter",
            label: "Twitter",
            placeholder: "@your_name",
            fieldType: "text"
          },
          {
            key: "instagram",
            label: "Instagram",
            placeholder: "your_name",
            fieldType: "text"
          }
        ]
      }
    ]
  },
  {
    key: "candidate",
    title: "Candidate",
    description:
      "Sobre la candidata como figura pública como la gente la identifica? Aquí son menos características de autoevaluación de la candidata, y más de imagen pública. El objetivo es identificar los puntos que la campaña tiene que valorizar (positivos) o minimizar (negativos). Ej: Al votante le gusta porque la candidata es joven, pero tiene una preocupación con su falta de experiência. Como comunicar las dos cosas?",
    fields: [
      {
        key: "positive_characteristic",
        label: "Positive Characteristic",
        fieldType: "text"
      },
      {
        key: "negative_characteristic",
        label: "Negative Characteristic",
        fieldType: "text"
      },
      {
        key: "talent",
        label: "One talent",
        fieldType: "text"
      },
      {
        key: "limitation",
        label: "One limitation",
        fieldType: "text"
      },
      {
        key: "life_experience",
        label: "One life experience",
        fieldType: "textarea"
      }
    ]
  },
  {
    key: "principles",
    title: "Principles",
    description:
      "Princípios son los valores que hacen la candidata tener credibilidad y pedir la confianza de sus electoras. Ej: Diálogo, eficiencia y transparencia.",
    fields: [
      {
        key: "principles",
        label: "Principles",
        fieldType: "repeater",
        limit: 3,
        fields: [
          {
            key: "title",
            label: "Title",
            fieldType: "text"
          },
          {
            key: "principle",
            label: "Describe your principle",
            fieldType: "textarea"
          }
        ]
      }
    ]
  },
  {
    key: "causes",
    title: "Causes",
    description:
      "Causas son los temas que la candidata más tiene familiaridad y defiende. Ej: Cultura, movilidad urbana y feminismo.",
    fields: [
      {
        key: "causes",
        label: "Primary causes",
        fieldType: "repeater",
        limit: 3,
        fields: [
          {
            key: "title",
            label: "Cause short name",
            fieldType: "text"
          },
          {
            key: "importance",
            label: "Why is this important for your city/state/country?",
            fieldType: "textarea"
          },
          {
            key: "capability",
            label: "What makes you capable of accomplishing this cause?",
            fieldType: "textarea"
          }
        ]
      }
    ]
  },
  {
    key: "commitments",
    title: "Commitments",
    description:
      "Compromisos son acciones que tu puedes tener una vez electo que no dependen de votaciones o aprobación de leyes. Ej. voy a transparentar todas mis cuentas / voy a firmar la 3 de 3.",
    fields: [
      {
        key: "commitments",
        label: "Main commitments",
        fieldType: "repeater",
        limit: 3,
        fields: [
          {
            key: "title",
            label: "Commitment short name",
            fieldType: "text"
          },
          {
            key: "explain",
            label: "Explain the commitment and why its relevant",
            fieldType: "textarea"
          }
        ]
      }
    ]
  },
  {
    key: "potential_voter",
    title: "Potential Voter",
    description:
      "El objetivo de esa sección es identificar 3 perfiles de potencial elector a partir de personas que ya sabes que van a votar en la candidata, evitando personas como tu mama porque probablemente personas como ellas no votarían en ti :)",
    fields: [
      {
        key: "profiles",
        label: "Profiles",
        fieldType: "repeater",
        limit: 3,
        fields: [
          {
            key: "name",
            label: "Person name",
            fieldType: "text"
          },
          {
            key: "tag",
            label: "Profile name/tag",
            fieldType: "text"
          },
          {
            key: "demographics",
            label: "Demographics",
            fieldType: "group",
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
                key: "ehtnicity",
                label: "Ethnicity",
                fieldType: "text"
              },
              {
                key: "education",
                label: "Education",
                fieldType: "select",
                options: educationOptions
              },
              {
                key: "social_class",
                label: "Social class",
                fieldType: "text"
              }
            ]
          },
          {
            key: "territory",
            label: "Territory",
            fieldType: "group",
            fields: [
              {
                key: "location",
                label: "Location",
                fieldType: "facebook_location"
              },
              {
                key: "neighbourhood",
                label: "Neighbourhood",
                fieldType: "text"
              },
              {
                key: "locus",
                label: "Locus",
                fieldType: "text"
              }
            ]
          },
          {
            key: "themes",
            label: "Thematic information",
            fieldType: "group",
            fields: [
              {
                key: "interests",
                label: "Interests",
                fieldType: "facebook_interests"
              }
            ]
          },
          {
            key: "emotional",
            label: "Emotional information",
            fieldType: "group",
            fields: [
              {
                key: "fears",
                label: "Fears",
                fieldType: "text"
              },
              {
                key: "desires",
                label: "Desires",
                fieldType: "text"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    key: "network",
    title: "Personal Network",
    description:
      "Para esta sección, el objetivo es mapear dos niveles de tus redes, la red más próxima y los principales influenciadores de tus redes.",
    fields: [
      {
        key: "voters",
        label: "Assured voters",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      },
      {
        key: "volunteers",
        label: "People that will get involved",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      },
      {
        key: "donors",
        label: "People that will donate",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      },
      {
        key: "influencers",
        label: "Influencers at reach",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      }
    ]
  },
  {
    key: "assets",
    title: "Assets",
    fields: [
      {
        key: "assets",
        label: "Assets",
        fieldType: "repeater",
        fields: [
          {
            key: "description",
            label: "Description",
            fieldType: "textarea"
          }
        ]
      }
    ]
  },
  {
    key: "team",
    title: "Team",
    description:
      "<p>Ahora hablemos de tu equipo de campaña. Toda campaña idealmente tiene que tener algunas actividades y gente responsable por ellas. Campañas activistas generalmente no tienen recursos para contratar personas, y trabajan más con amigos/colegas para realizar las actividades. Identifiquémoslos.</p> <p>Las coordinaciones de campaña son</p>" +
      "<ul>" +
      "<li>Coordinación general</li>" +
      "<li>Comunicación</li>" +
      "<li>Financiero/fondos</li>" +
      "<li>Jurídico</li>" +
      "<li>Movilización/território</li>" +
      "<li>Agenda</li>" +
      "<li>Alianzas</li>" +
      "<li>Encuestas</li>" +
      "</ul>",
    fields: [
      {
        key: "team",
        label: "Team",
        fieldType: "repeater",
        fields: [
          ...personFields,
          {
            key: "Role",
            label: "Role",
            fieldType: "select",
            options: {
              general_coordination: "General coordination",
              communication: "Communication",
              finance: "Finance",
              legal: "Legal",
              mobilization: "Mobilization/Territory",
              schedule: "Schedule",
              alliances: "Alliances",
              polling: "Polling"
            }
          },
          {
            key: "hours",
            label: "Participation",
            fieldType: "select",
            options: {
              full_time: "Full time",
              part_time: "Part time"
            }
          },
          {
            key: "remunerated",
            label: "Is this member remunerated?",
            fieldType: "boolean"
          },
          {
            key: "experience",
            label: "Experience level for the role",
            fieldType: "select",
            options: {
              none: "None",
              little: "Little experience",
              reasonable: "Reasonable experience",
              expert: "Expert"
            }
          },
          {
            key: "bio",
            label: "Short biography",
            fieldType: "textarea"
          }
        ]
      }
    ]
  },
  {
    key: "funds",
    title: "Funds",
    fields: [
      {
        key: "expense",
        label: "How much the campaign will spend",
        fieldType: "text"
      },
      {
        key: "funders",
        label: "Who will finance",
        fieldType: "textarea"
      }
    ]
  }
];
