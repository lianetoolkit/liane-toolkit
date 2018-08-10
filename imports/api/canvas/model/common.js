export const genderOptions = {
  cis_woman: "Mulher Cis",
  cis_man: "Homem Cis",
  trans_woman: "Mulher Trans",
  cis_male: "Homem Trans",
  travesti: "Travesti",
  non_binary: "Não binario"
};

export const raceOptions = {
  asian: "Amarelo",
  white: "Branco",
  indigenous: "Indigena",
  brown: "Pardo",
  black: "Negro"
};

export const educationOptions = {
  none: "Nenhum",
  high: "Médio",
  college: "Superior",
  middle: "Básico"
};

export const socialClassOptions = {
  low: "Baixa",
  medium_low: "Média Baixa",
  medium: "Média",
  medium_high: "Média Alta",
  high: "Alta"
};


export const personFields = [
  {
    key: "name",
    label: "Nome",
    fieldType: "text"
  },
  {
    key: "email",
    label: "Email",
    fieldType: "text"
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
    key: "cellphone",
    label: "Celular",
    fieldType: "text"
  }
];
