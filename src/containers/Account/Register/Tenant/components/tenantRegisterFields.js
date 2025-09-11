export const tenantRegistrationFields = (t) => [
  {
    elementType: "subtitle",
    title: `${t("register.tenant")} :`,
  },
  {
    name: "tenant_name",
    label: t("account.profile.tenant_name"),
    type: "text",
    placeholder: t("account.profile.tenant_name"),
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
    name: "city",
    label: t("account.profile.city"),
    type: "text",
    placeholder: t("account.profile.city"),
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
    name: "country",
    label: t("account.profile.country"),
    type: "text",
    placeholder: t("account.profile.country"),
    defaultValue: "",
    tooltip: {
      exist: false,
      id: "",
      description: "",
    },
    rules: {
      required: false,
    },
  },
  {
    name: "postal_code",
    label: t("account.profile.postal_code"),
    type: "text",
    transform: (val) => val.toUpperCase(),
    placeholder: "H1H 1H1",
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
  {
    name: "know_about_us",
    label: t("register.know_about_us"),
    type: "text",
    placeholder: t("register.know_about_us"),
    defaultValue: "",
    tooltip: {
      exist: false,
      id: "",
      description: "",
    },
    rules: {
      required: false,
    },
  }
];
