export const confirmRegistrationFields = (t) => [
  {
    elementType: "subtitle",
    title: `${t("register.responsible_persone")} :`,
  },
  {
    name: "first_name",
    label: t("register.first_name"),
    type: "text",
    placeholder: t("register.first_name"),
    defaultValue: "",
    tooltip: {
      exist: false,
      id: "",
      description: "",
    },
    rules: {
      required: true,
    },
  },
  {
    name: "last_name",
    label: t("register.last_name"),
    type: "text",
    placeholder: t("register.last_name"),
    defaultValue: "",
    tooltip: {
      exist: false,
      id: "",
      description: "",
    },
    rules: {
      required: true,
    },
  },
  {
    name: "password",
    label: t("register.password"),
    type: "password",
    placeholder: t("register.password"),
    defaultValue: "",
    tooltip: {
      exist: false,
      id: "",
      description: "",
    },
    rules: {
      required: true,
    },
  },
  {
    name: "confirm_password",
    label: t("register.confirm_password"),
    type: "password",
    placeholder: t("register.confirm_password"),
    defaultValue: "",
    tooltip: {
      exist: false,
      id: "",
      description: "",
    },
    rules: {
      required: true,
    },
  },
];
