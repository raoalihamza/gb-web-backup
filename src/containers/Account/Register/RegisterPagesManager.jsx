import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import TenantRegisterPage from "./Tenant";
import CityRegisterPage from "./City";
import OrganisationRegisterPage from "./Organisation";
import { ConfirmRegisterPage } from "../ConfirmRegister";
import { ConfirmRegisterTenantPage } from "../ConfirmRegisterTenant";

const RegisterPagesManager = () => {
  const params = useParams();
  const Component = useMemo(() => {
    if (params.entity) {
      switch (params.entity) {
        case "tenant":
          return <TenantRegisterPage />;
        case "city":
          return <CityRegisterPage />;
        case "organisation":
          return <OrganisationRegisterPage />;
        case "confirm":
          return <ConfirmRegisterPage />;
        case "confirm-tenant":
          return <ConfirmRegisterTenantPage />;

        default:
          break;
      }
    }
  }, [params.entity]);

  return Component;
};

export default RegisterPagesManager;
