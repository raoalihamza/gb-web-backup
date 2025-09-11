export const confirmRegistrationFields = (t) => [
  {
    elementType: "subtitle",
    title: `${t("register.responsible_persone")} :`,
  },
  {
    name: "email",
    label: t("account.profile.email"),
    type: "text",
    placeholder: "example@mail.com",
    defaultValue: "",
    tooltip: {
      exist: true,
      id: "email-note",
      description: t("register.email_note"),
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
