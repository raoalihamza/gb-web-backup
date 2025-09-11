import { useState, useEffect, useMemo, useCallback } from "react";
import { Grid, TextField } from "@material-ui/core";
import gpColors from "constants/gpColors";
import { useTranslation, Trans } from "react-i18next";
import styled from "styled-components";
import DropdownPicker from "atomicComponents/DropDown";
import { AVAILABLE_FILTER_TYPES_TENANT } from "atomicComponents/FilterDatePicker";
import { Button } from "reactstrap";
import Toast, { toast } from "shared/components/Toast";
import Categories from "containers/Categories/index";
import cityHooks from "hooks/city.hooks";

const Wrapper = styled.div`
  padding: 30px;
`;

const SettingName = styled.h5`
  font-weight: 600;
  margin-bottom: 8px;
`;
const SettingDetails = styled.div`
  color: ${gpColors.darkGrey};
`;

const GridRow = styled.div`
  margin-bottom: 40px;
`;

const CityTenantSettings = ({ cityId, disabled }) => {
  const { t } = useTranslation("common");

  const [transactionsPerProductPerUser, setTransactionsPerProductPerUser] = useState("");
  const [daysBeforeOrdersexpire, setDaysBeforeOrdersexpire] = useState("");

  const [userTransactionsPerPeriod, setUserTransactionsPerPeriod] = useState({
    value: "",
    period: null,
  });

  const { limitSettings } = cityHooks.useFetchCityLimitSettings(cityId);
  const updateSettings = cityHooks.useUpdateCityLimitSettings(cityId);

  useEffect(() => {
    if (limitSettings) {
      const {
        c17_transactions_user_period,
        transactionsPerProductPerUser,
        c26_order_expiration

      } = limitSettings;

      if (c17_transactions_user_period) {
        const { period, value } = c17_transactions_user_period;
        const label = t(AVAILABLE_FILTER_TYPES_TENANT[c17_transactions_user_period.period]?.label);

        setUserTransactionsPerPeriod({
          value,
          period: { value: period, label },
        });
      }


      if (transactionsPerProductPerUser) {
        setTransactionsPerProductPerUser(transactionsPerProductPerUser.value)
      }

      if (c26_order_expiration) {
        setDaysBeforeOrdersexpire(c26_order_expiration.expirationDays)
      }
    }
  }, [limitSettings, t]);

  const perRange = useMemo(
    () =>
      Object.keys(AVAILABLE_FILTER_TYPES_TENANT).reduce((acc, next) => {
        return acc.concat({
          label: t(AVAILABLE_FILTER_TYPES_TENANT[next].label),
          value: next,
        });
      }, []),
    [t]
  );

  useEffect(() => {
    setUserTransactionsPerPeriod((prev) => ({ ...prev, period: perRange[0] }));
  }, [perRange]);

  const onSubmit = useCallback(
    async (field, settings) => {
      try {
        updateSettings(field, settings);

        toast.success(t("settings.success"));
      } catch (error) {
        toast.error(t("settings.failure"));
        console.error("Failed to update organization settings", error);
      }
    },
    [t, updateSettings]
  );

  return (
    <Wrapper>
      <Grid container spacing={3}>
        <Grid item xs={6} md={4}>
          <GridRow>
            <SettingName>{t("settings.maximum_of_transactions_user")}</SettingName>
            <SettingDetails>{t("settings.maximum_of_transactions_user_details")}</SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={6} md={8}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={2}>
              <TextField
                value={userTransactionsPerPeriod.value}
                onChange={(event) =>
                  setUserTransactionsPerPeriod((prev) => ({ ...prev, value: event.target.value }))
                }
                variant="outlined"
                size="small"
                disabled={disabled}
              />
            </Grid>
            <Grid item xs={1}>
              {t("settings.per")}
            </Grid>
            <Grid item xs={3}>
              <DropdownPicker
                value={userTransactionsPerPeriod.period}
                items={perRange}
                onChange={(item) =>
                  setUserTransactionsPerPeriod((prev) => ({ ...prev, period: item }))
                }
                disabled={disabled}
              />
            </Grid>
            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                disabled={disabled}
                onClick={() =>
                  onSubmit("c17_transactions_user_period", {
                    granted: true,
                    value: Number(userTransactionsPerPeriod.value),
                    period: userTransactionsPerPeriod?.period?.value,
                  })
                }
              >
                {t("forms.submit")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <GridRow>
            <SettingName>
              {t("settings.maximum_number_of_transaction_per_product_per_user")}
            </SettingName>
            <SettingDetails>
              <Trans i18nKey="settings.maximum_number_of_transaction_per_product_per_user_details">
                {t("settings.maximum_number_of_transaction_per_product_per_user_details")}
              </Trans>
            </SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={2}>
              <TextField
                value={transactionsPerProductPerUser}
                onChange={(event) => setTransactionsPerProductPerUser(event.target.expirationDays)}
                variant="outlined"
                size="small"
                type="number"
                disabled={disabled}
              />
            </Grid>
            <Grid item xs={4}></Grid>
            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                onClick={() =>
                  onSubmit("transactionsPerProductPerUser", {
                    granted: true,
                    value: Number(transactionsPerProductPerUser)
                  })
                }
                disabled={disabled}
              >
                {t("forms.submit")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <GridRow>
            <SettingName>
              {t("settings.number_of_days_before_orders_expire")}
            </SettingName>
            <SettingDetails>
              <Trans i18nKey="settings.number_of_days_before_orders_expire_details">
                {t("settings.number_of_days_before_orders_expire_details")}
              </Trans>
            </SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={2}>
              <TextField
                value={daysBeforeOrdersexpire}
                onChange={(event) => setDaysBeforeOrdersexpire(event.target.value)}
                variant="outlined"
                size="small"
                type="number"
                disabled={disabled}
              />
            </Grid>
            <Grid item xs={4}></Grid>
            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                onClick={() =>
                  onSubmit("daysBeforeOrdersexpire", {
                    granted: true,
                    value: Number(daysBeforeOrdersexpire)
                  })
                }
                disabled={disabled}
              >
                {t("forms.submit")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Categories />

      <Toast />
    </Wrapper>
  );
};

export default CityTenantSettings;
