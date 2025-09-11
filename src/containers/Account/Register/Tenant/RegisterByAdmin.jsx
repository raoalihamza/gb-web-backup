import React, { useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RegisterForm from "../sharedRegisterComponents/RegisterForm";
import firebase from "../../../firebase";

import { tenantRegistrationByAdminFields } from "./components/tenantRegisterByAdminFields";
import { validateRegisterByAdmin } from "./components/validateRegisterByAdmin";
import CardBox from "atomicComponents/CardBox";
import { useSelector } from "react-redux";
import { isUserAdminSelector } from "redux/selectors/user";
import { createPendingTenant } from "services/tenants";
import { TENANTS_STATUSES } from "constants/statuses";
import usersHooks from "hooks/users.hooks";


export function RegisterTenantByAdmin() {
  const { t } = useTranslation("common");
  const history = useHistory();
  const {userId} = usersHooks.useExternalUser();
  const isAdmin = useSelector(isUserAdminSelector);

  const handleSubmit = useCallback(
    async (data) => {
      if (!isAdmin) {
        return history.goBack();
      }

      data = {
        name: data.tenant_name,
        cityId: userId,
        city: data.city,
        role: "tenant",
        country: data.country ?? "",
        firstName: data.first_name,
        lastName: data.last_name,
        knowAboutUs: data.know_about_us ?? "",
        postalCode: data.postal_code,
        createdOn: firebase.firestore.FieldValue.serverTimestamp(),
        updatedOn: firebase.firestore.FieldValue.serverTimestamp(),
        status: TENANTS_STATUSES.pending,
      };
  
      await createPendingTenant(data);
      history.goBack();
    },
    [userId, history, isAdmin]
  );

  const registrationFields = tenantRegistrationByAdminFields(t);

  return (
    <CardBox>
      <RegisterForm
        registrationFields={registrationFields}
        validateFunction={validateRegisterByAdmin}
        onSubmit={handleSubmit}
        buttonText={t("register.tenant_title")}
      />
    </CardBox>
  );
}
