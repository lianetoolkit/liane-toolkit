import { genderOptions, educationOptions, personFields, raceOptions, socialClassOptions } from "./common";

export default [
  {
    key: "basic_info",
    title: "Informações básicas",
    description: "Vamos começar com informações básicas da candidatura.",
    fields: [
      {
        key: "name_bb",
        label: "Seu nome na urna",
        fieldType: "text",
        print: true
      },
      {
        key: "party_name",
        label: "Nome do partido",
        fieldType: "text",
        print:true
      },
      {
        key: "electoral_post",
        label: "Cargo",
        fieldType: "text",
        print: true
      },
      {
        key: "number",
        label: "Numero na urna",
        fieldType: "text",
        print:true
      },
      {
        key: "age",
        label: "Idade",
        fieldType: "text"
      },
      {
        key: "location",
        label: "Localização",
        fieldType: "facebook_location",
        print: true
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
      "Como as pessoas identificam a candidata? Aqui são menos caracteristicas de auto-avaliação e mais de imagem pública. O objetivo é identificar os pontos que a campanha tem (positivas) ou minimizar (negativas). Ex: O eleitor gosta porque a candidata é jovem, porém se preocupa com a falta de experiência. Como comunicar as duas coisas?",
    fields: [
      {
        key: "positive_characteristic",
        label: "Característica positiva",
        description: "Liste aqui uma característica positiva que te diferencie, algo que - do ponto de vista eleitoral - você acredite que é um valor que vá atrair os eleitores:\n\n'Eu votaria na candidata por que ela é__________'",
        fieldType: "text",
        print: true
      },
      {
        key: "negative_characteristic",
        label: "Característica negativa",
        description: "Liste aqui uma característica negativa, algo que - do ponto de vista eleitoral - você acredite que vá afastar os eleitores:\n\n'Eu não votaria na candidata por que ela é _________'\n\n'Eu até votaria na candidata mas ela é _________'",
        fieldType: "text",
        print: true
      },
      {
        key: "talent",
        label: "Um talento",
        description: "Aqui é uma habilidade ou talento que você tem que te ajude a ser uma boa parlamentar.",
        fieldType: "text",
        print: true
      },
      {
        key: "limitation",
        label: "Uma limitação",
        description: "Aqui é uma limitação, uma dificuldade que você tenha que pode te atrapalhar ou dificultar em ser uma boa parlamentar.",
        fieldType: "text",
        print: true
      },
      {
        key: "life_experience",
        label: "Uma experiência de vida",
        description: "De maneira muito sintética e direta contar uma história sobre algo que você vivenciou e que possa expressar os pontos elencados acima.\nProcure uma história que evidencia sua característica positiva e o uso do seu talento e que - de preferência - mostre também como você superou sua característica negativa e sua limitação para chegar no fim da história.",
        fieldType: "textarea",
        print: true
      }
    ]
  },
  {
    key: "principles",
    title: "Princípios",
    description:
      "Liste três princípios que vão te guiar por todo e qualquer processo, aquilo que é caro e verdadeiro para você não importando o contexto.\nPara ajudar a dar clareza ao princípio, mesmo que pareça óbvio, descreva em uma frase o que esse princípio significa.",
    fields: [
      {
        key: "principles",
        label: "Princípios",
        fieldType: "repeater",
        print: true,
        limit: 3,
        fields: [
          {
            key: "title",
            label: "Título",
            fieldType: "text",
            print: true
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
      "Liste três causas que você vai defender no mandato, são áreas e bandeiras onde você vai concentrar os esforços de atuação parlamentar.",
    fields: [
      {
        key: "causes",
        label: "Causas principais",
        fieldType: "repeater",
        print: true,
        limit: 3,
        fields: [
          {
            key: "title",
            label: "Título",
            fieldType: "text",
            print: true
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
      "Compromissos são ações concretas que você vai cumprir durante seu mandato. Em geral, aqui, pela própria limitação da atuação parlamentar, faz mais sentido se comprometer com *forma* (isso é, como você vai operar e fazer as construções políticas) do que conteúdo (o que você vai fazer durante o mandato).",
    fields: [
      {
        key: "commitments",
        label: "Compromissos principais",
        fieldType: "repeater",
        print: true,
        limit: 3,
        fields: [
          {
            key: "title",
            label: "Título",
            fieldType: "text",
            print: true
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
    title: "Eleitoras em potencial",
    description:
      "A ideia é você descrever um eleitor ou eleitora real, alguém com nome e sobrenome que você sabia que vai votar em você e depois generalizar as características dessa pessoa para encontrar perfis de eleitores.\n\n'Rodrigo, branco, 26 anos, morador de Pinheiros, é estudante universitário da PUC e cursa administração pública vai votar em mim porque acredita que eu tenho experiência de gestão pública'\n\nFlávia, negra, 33 anos, mora na Lapa, é mãe solo e trabalha com comunicação, vai votar em mim porque reconhece em mim uma feminista preocupada com a infância'",
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
                key: "ethnicity",
                label: "Raça",
                fieldType: "select",
                options: raceOptions
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
                fieldType: "select",
                options: socialClassOptions
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
                label: "Local",
                description:
                  "Onde podemos encontrar essa pessoa na cidade? ex: Café, Universidade, Praça, Praia, etc",
                fieldType: "text"
              }
            ]
          },
          {
            key: "themes",
            label: "Interesses",
            description: "Esse campo é conectado com interesses do Facebook portanto está em inglês e é limitado.",
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
                description:
                  "Qual o principal medo dessa pessoa hoje? Ex: 'Perder meu emprego', 'Não conseguir prover para os meus filhos', 'Não conseguir me aposentar'",
                fieldType: "text"
              },
              {
                key: "desires",
                label: "Desejos",
                description:
                  "Qual o principal desejo dessa pessoa? Ex: 'Quero entrar na faculdade para garantir um bom emprego', 'Quero andar na rua sem ter medo'",
                fieldType: "text"
              }
            ]
          },
          {
            key: "reason",
            label: "Motivo",
            description: "Descreva em uma frase porque essa pessoa vai votar em você.",
            fieldType: "text"
          },
          {
            key: "tag",
            label: "Nome do perfil",
            description: "Use um nome que identifique genericamente esse tipo de eleitor.\n\nJovem universitário ativista.",
            fieldType: "text"
          }
        ]
      }
    ]
  },
  {
    key: "network",
    title: "Redes",
    description:
      "Toda campanha parte das redes mais próximas, abaixo mapeie seus primeiros eleitores, voluntários, doadores e influenciadores. Também identifique seus competidores.",
    fields: [
      {
        key: "voters",
        label: "Votos garantidos",
        description:
          "Nomeie pessoas de perfis diferentes que você tem certeza que votarão em você.",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      },
      {
        key: "volunteers",
        label: "Voluntários",
        description:
          "Nomeie pessoas que você sabe que vão se voluntariar para trabalhar na sua campanha",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      },
      {
        key: "donors",
        label: "Doadores",
        description:
          "Nomeie pessoas que podem doar dinheiro para sua campanha - qualquer quantidade",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      },
      {
        key: "influencers",
        label: "Influenciadores",
        description:
          "Nomeie influenciadores, pessoas com redes sociais com grande alcance online ou offline",
        fieldType: "repeater",
        limit: 10,
        fields: personFields
      },
      {
        key: "competitors",
        label: "Competidores",
        fieldType: "repeater",
        print: true,
        limit: 10,
        fields: [
          {
            key: "name",
            label: "Nome",
            fieldType: "text",
            print: true
          },
          {
            key: "party",
            label: "Partido",
            fieldType: "text",
            print: true
          },
          {
            key: "location",
            label: "Local",
            fieldType: "facebook_location"
          },
          {
            key: "facebook_url",
            label: "Link facebook",
            fieldType: "text"
          },
          {
            key: "twitter_url",
            label: "Link twitter",
            fieldType: "text"
          }
        ]
      }
    ]
  },
  {
    key: "assets",
    title: "Diferenciais de campanha",
    description:
      "São todos os recursos materiais/humanos/financeiros que você dispõe para dar força a sua campanha",
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
      "Liste aqui qual é a sua estrutura de campanha, quais são os cargos e quem vai ocupar esses cargos.\n\nNão tem problema se você não tiver os nomes ainda, mas é importante então você identificar esses perfis para justamente poder buscar.\n\nAcesse [aqui](https://docs.google.com/document/d/14w9e0ZoLnA7FSoXTkoZLrQJYksb3Fv6Dz6hEagawQFU/edit?usp=sharing) uma sugestão de estrutura de campanha.",
    fields: [
      {
        key: "team",
        label: "Equipe",
        fieldType: "repeater",
        print: true,
        fields: [
          {
            key: "name",
            label: "Nome",
            fieldType: "text",
            print: true
          },
          {
            key: "email",
            label: "Email",
            fieldType: "text"
          },
          {
            key: "cellphone",
            label: "Celular",
            fieldType: "text"
          },
          {
            key: "role",
            label: "Função",
            fieldType: "select",
            print: true,
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
            label: "Experiência na função",
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
            description: "ATENÇÃO: Pode ser usado no site.",
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
        label: "Quanto vai custar sua campanha?",
        description:
          "Esse número pode ser um chute. É importante você começar a pensar sobre isso.",
        fieldType: "text",
        print:true
      },
      {
        key: "funders",
        label: "Como você vai financiar?",
        description:
          "Crowdfunding, amigos da família, rede de apoiadores, nomeie aqui como pretende captar esses recursos.",
        fieldType: "textarea",
        print:true
      }
    ]
  }
];
