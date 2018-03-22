import { genderOptions, educationOptions, personFields } from "./common";

export default [
  {
    key: "basic_info",
    title: "Informações básicas",
    description: "Vamos começar com informações básicas da candidatura",
    fields: [
      {
        key: "name_bb",
        label: "Seu nome na urna",
        fieldType: "text"
      },
      {
        key: "party_name",
        label: "Nome do partido",
        fieldType: "text"
      },
      {
        key: "number",
        label: "Numero na urna",
        fieldType: "text"
      },
      {
        key: "age",
        label: "Idade",
        fieldType: "text"
      },
      {
        key: "location",
        label: "Localização",
        fieldType: "facebook_location"
      },
      {
        key: "occupation",
        label: "Ocupação",
        fieldType: "text"
      },
      {
        key: "social_networks",
        label: "Suas redes sociais",
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
    title: "Candidata",
    description:
      "Sobre la candidata como figura pública como la gente la identifica? Aquí son menos características de autoevaluación de la candidata, y más de imagen pública. El objetivo es identificar los puntos que la campaña tiene que valorizar (positivos) o minimizar (negativos). Ej: Al votante le gusta porque la candidata es joven, pero tiene una preocupación con su falta de experiência. Como comunicar las dos cosas?",
    fields: [
      {
        key: "positive_characteristic",
        label: "Caracteristica positiva",
        fieldType: "text"
      },
      {
        key: "negative_characteristic",
        label: "Caracteristica negativa",
        fieldType: "text"
      },
      {
        key: "talent",
        label: "Um talento",
        fieldType: "text"
      },
      {
        key: "limitation",
        label: "Uma limitação",
        fieldType: "text"
      },
      {
        key: "life_experience",
        label: "Uma experiência de vida",
        fieldType: "textarea"
      }
    ]
  },
  {
    key: "principles",
    title: "Princípios",
    description:
      "Princípios son los valores que hacen la candidata tener credibilidad y pedir la confianza de sus electoras. Ej: Diálogo, eficiencia y transparencia.",
    fields: [
      {
        key: "principles",
        label: "Princípios",
        fieldType: "repeater",
        limit: 3,
        fields: [
          {
            key: "title",
            label: "Título",
            fieldType: "text"
          },
          {
            key: "principle",
            label: "Descreva",
            fieldType: "textarea"
          }
        ]
      }
    ]
  },
  {
    key: "causes",
    title: "Causas",
    description:
      "Causas son los temas que la candidata más tiene familiaridad y defiende. Ej: Cultura, movilidad urbana y feminismo.",
    fields: [
      {
        key: "causes",
        label: "Causas principais",
        fieldType: "repeater",
        limit: 3,
        fields: [
          {
            key: "title",
            label: "Descrição",
            fieldType: "text"
          },
          {
            key: "importance",
            label: "Por que esta é uma causa importante?",
            fieldType: "textarea"
          },
          {
            key: "capability",
            label: "O que te fez capaz de atuar nessa causa?",
            fieldType: "textarea"
          }
        ]
      }
    ]
  },
  {
    key: "commitments",
    title: "Compromissos",
    description:
      "Compromisos son acciones que tu puedes tener una vez electo que no dependen de votaciones o aprobación de leyes. Ej. voy a transparentar todas mis cuentas / voy a firmar la 3 de 3.",
    fields: [
      {
        key: "commitments",
        label: "Compromissos principais",
        fieldType: "repeater",
        limit: 3,
        fields: [
          {
            key: "title",
            label: "Título",
            fieldType: "text"
          },
          {
            key: "explain",
            label: "Descrição",
            fieldType: "textarea"
          }
        ]
      }
    ]
  },
  {
    key: "potential_voter",
    title: "Pleitoras em potencial",
    description:
      "El objetivo de esa sección es identificar 3 perfiles de potencial elector a partir de personas que ya sabes que van a votar en la candidata, evitando personas como tu mama porque probablemente personas como ellas no votarían en ti :)",
    fields: [
      {
        key: "profiles",
        label: "Perfis",
        fieldType: "repeater",
        limit: 3,
        fields: [
          {
            key: "name",
            label: "Nome da pessoa",
            fieldType: "text"
          },
          {
            key: "tag",
            label: "Nome do perfil",
            fieldType: "text"
          },
          {
            key: "demographics",
            label: "Informações demograficas",
            fieldType: "group",
            fields: [
              {
                key: "age",
                label: "Idade",
                fieldType: "text"
              },
              {
                key: "gender",
                label: "Genero",
                fieldType: "select",
                options: genderOptions
              },
              {
                key: "ehtnicity",
                label: "Raça",
                fieldType: "text"
              },
              {
                key: "education",
                label: "Educação",
                fieldType: "select",
                options: educationOptions
              },
              {
                key: "social_class",
                label: "Classe social",
                fieldType: "text"
              }
            ]
          },
          {
            key: "territory",
            label: "Território",
            fieldType: "group",
            fields: [
              {
                key: "location",
                label: "Localização",
                fieldType: "facebook_location"
              },
              {
                key: "neighbourhood",
                label: "Bairro",
                fieldType: "text"
              },
              {
                key: "locus",
                label: "Locus",
                description: "Onde podemos encontrar essa pessoa? ex: Café, Universidade, Praça, Praia, etc",
                fieldType: "text"
              }
            ]
          },
          {
            key: "themes",
            label: "Interesses",
            fieldType: "group",
            fields: [
              {
                key: "interests",
                label: "Interesses",
                fieldType: "facebook_interests"
              }
            ]
          },
          {
            key: "emotional",
            label: "Emocional",
            fieldType: "group",
            fields: [
              {
                key: "fears",
                label: "Medos",
                description: "Do que essa pessoa tema medo? Ex: desemprego, violência, ficar doente",
                fieldType: "text"
              },
              {
                key: "desires",
                label: "Desejos",
                description: "Quais são os sonhos e desejos dessa pessoa? Ex: entrar na faculdade, comprar a casa própria, formar uma família",
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
    title: "Redes",
    description:
      "Para esta sección, el objetivo es mapear dos niveles de tus redes, la red más próxima y los principales influenciadores de tus redes.",
    fields: [
      {
        key: "voters",
        label: "Votos garantidos",
        description: "Nomeie pessoas de perfis diferentes que você tem certeza que votarão em você.",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      },
      {
        key: "volunteers",
        label: "Voluntários",
        description: "Nomeie pessoas que você sabe que vão se voluntariar para trabalhar na sua campanha",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      },
      {
        key: "donors",
        label: "Doadores",
        description: "Nomeie pessoas que podem doar dinheiro para sua campanha - qualquer quantidade",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      },
      {
        key: "influencers",
        label: "Influenciadores",
        description: "Nomeie influenciadores, pessoas com redes sociais com grande alcance online ou offline",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      }
    ]
  },
  {
    key: "assets",
    title: "Ativos",
    description: "Ativos são todos os recursos materiais/humanos/financeiros que você dispõe para dar força a sua campanha",
    fields: [
      {
        key: "assets",
        label: "Ativos",
        fieldType: "repeater",
        fields: [
          {
            key: "description",
            label: "Descrição",
            fieldType: "textarea"
          }
        ]
      }
    ]
  },
  {
    key: "team",
    title: "Equipe",
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
        label: "Equipe",
        fieldType: "repeater",
        fields: [
          ...personFields,
          {
            key: "role",
            label: "Papel",
            fieldType: "select",
            options: {
              general_coordination: "Coordenadora geral",
              communication: "Comunicação",
              finance: "Financeiro",
              legal: "Jurídico",
              mobilization: "Mobilização/Território",
              schedule: "Agenda",
              alliances: "Alianças",
              politics: "Política"
            }
          },
          {
            key: "hours",
            label: "Tempo disponível",
            fieldType: "select",
            options: {
              full_time: "Integral",
              part_time: "Parcial"
            }
          },
          {
            key: "remunerated",
            label: "Vai ser remunerado?",
            fieldType: "boolean"
          },
          {
            key: "experience",
            label: "Experiência no papel",
            fieldType: "select",
            options: {
              none: "Nenhuma",
              little: "Pouca",
              reasonable: "Razoável",
              expert: "Expert"
            }
          },
          {
            key: "bio",
            label: "Mini-bio",
            description: "Pode ser usado no site.",
            fieldType: "textarea"
          }
        ]
      }
    ]
  },
  {
    key: "funds",
    title: "Dinheiro",
    fields: [
      {
        key: "expense",
        label: "Quanto você vai gastar na campanha?",
        description: "Esse número pode ser um chute. É importante você começar a pensar sobre isso.",
        fieldType: "text"
      },
      {
        key: "funders",
        label: "Quem e como vai financiar?",
        description: "Crowdfunding, amigos da família, rede de apoiadores, nomeie aqui como pretende captar esses recursos",
        fieldType: "textarea"
      }
    ]
  }
];
