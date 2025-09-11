import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import TextField from "atomicComponents/TextField";
import { Controller, useForm } from "react-hook-form";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Wrapper = styled.div``;
const Form = styled.form``;

let defaultValues = {
  name: "",
  apiKey: "",
};

export const MAILERLITE_SETTINGS_FORM_ID = "product-form";

const MailerLiteSettings = ({ userID, mailerLiteSettings, updateMailerLiteSettings }) => {
  const [t] = useTranslation("common");

  const [visibleKey, setVisibleKey] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: defaultValues,
    values: mailerLiteSettings,
  });

  const onSubmit = useCallback(
    async (values) => {
      try {

        await updateMailerLiteSettings(values);
        setVisibleKey(false);
        toast.success(t("settings.success"));
      } catch (error) {
        console.log("error", error);
        toast.error(t("settings.failure"));
      }
    },
    [t, updateMailerLiteSettings]
  );

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit((data) => onSubmit({ ...data }))} id={MAILERLITE_SETTINGS_FORM_ID}>
        {/* //? hack to avoid browser attempts to autocomplete fields */}
        <div style={{ display: "none" }}>
          <input type="password" />
        </div>
        <div style={{ margin: "0", marginBottom: "10px" }} >La clé API peut être obtenu en visitant ce lien et en appuyant sur <strong>Generate new token</strong> : <Link to="https://dashboard.mailerlite.com/integrations/api">https://dashboard.mailerlite.com/integrations/api </Link></div>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              label={t("dashboard_commerce.token_name")}
              value={field.value}
              onChange={field.onChange}
              style={{ margin: "0", marginBottom: "10px" }}
              name="name"
              autocomplete="new-password"
            />
          )}
        />
        <Controller
          name="apiKey"
          control={control}
          render={({ field }) => (
            <TextField
              label={t("dashboard_commerce.apiKey")}
              value={field.value}
              onChange={(e) => {
                field.onChange(e);
                if (field.value) {
                  setVisibleKey(true);
                }
              }}
              style={{ margin: "0", marginBottom: "10px" }}
              type={visibleKey ? "text" : "password"}
              autocomplete="new-password"
              name="apiKey"
            />
          )}
        />
        <div className="">
          <Button color="primary" type="submit">
            {t("forms.submit")}
          </Button>
        </div>
      </Form>
    </Wrapper>
  );
};

export default MailerLiteSettings;
