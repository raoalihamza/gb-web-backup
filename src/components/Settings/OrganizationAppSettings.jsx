import { useState, useEffect, useMemo, useCallback } from "react";
import { Grid, TextField } from "@material-ui/core";
import gpColors from "constants/gpColors";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import DropdownPicker from "atomicComponents/DropDown";
import { AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import { Button } from "reactstrap";
import oranizationHooks from "hooks/organization.hooks";
import { useAuth } from "shared/providers/AuthProvider";
import Toast, { toast } from "shared/components/Toast";

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

const OrganizationAppSettings = () => {
  const { t } = useTranslation("common");
  const [challengePerUser, setChallengePerUser] = useState({
    value: "",
    period: null,
  });
  const [kmPerTrip, setKmPerTrip] = useState("");
  const [manualTrips, setManualTrips] = useState({
    value: "",
    period: null,
  });
  const [userTransactionsPerPeriod, setUserTransactionsPerPeriod] = useState({
    value: "",
    period: null,
  });
  const [organizationID] = useAuth();
  const { limitSettings } = oranizationHooks.useFetchOrganizationLimitSettings(organizationID);
  const updateSettings = oranizationHooks.useUpdateOrganizationLimitSettings(organizationID);

  useEffect(() => {
    if (limitSettings) {
      const { challengePerUser, kmPerTrip, manualTrips, transactionsOfUserPerPeriod } =
        limitSettings;

      if (challengePerUser) {
        const { period } = challengePerUser;
        const label = t(AVAILABLE_FILTER_TYPES[challengePerUser.period]?.label);

        setChallengePerUser({ value: challengePerUser.value, period: { value: period, label } });
      }

      if (kmPerTrip) {
        setKmPerTrip(kmPerTrip);
      }

      if (manualTrips) {
        const { period } = manualTrips;
        const label = t(AVAILABLE_FILTER_TYPES[manualTrips.period]?.label);

        setManualTrips({ value: manualTrips.value, period: { value: period, label } });
      }

      if (transactionsOfUserPerPeriod) {
        const { period, value } = transactionsOfUserPerPeriod;
        const label = t(AVAILABLE_FILTER_TYPES[transactionsOfUserPerPeriod.period]?.label);

        setUserTransactionsPerPeriod({
          value,
          period: { value: period, label },
        });
      }
    }
  }, [limitSettings, t]);

  const perRange = useMemo(
    () =>
      Object.keys(AVAILABLE_FILTER_TYPES).reduce((acc, next) => {
        return acc.concat({
          label: t(AVAILABLE_FILTER_TYPES[next].label),
          value: next,
        });
      }, []),
    [t]
  );

  useEffect(() => {
    setChallengePerUser((prev) => ({ ...prev, period: perRange[0] }));
    setManualTrips((prev) => ({ ...prev, period: perRange[0] }));
    setUserTransactionsPerPeriod((prev) => ({ ...prev, period: perRange[0] }));
  }, [perRange]);

  const onSubmit = useCallback(
    async (field, settings) => {
      try {
        await updateSettings(field, settings);

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
        <Grid item xs={12} md={4}>
          <GridRow>
            <SettingName>{t("settings.maximum_challenge_per_user")}</SettingName>
            <SettingDetails>{t("settings.maximum_challenge_per_details")}</SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={2}>
              <TextField
                value={challengePerUser.value}
                onChange={(event) =>
                  setChallengePerUser((prev) => ({ ...prev, value: event.target.value }))
                }
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={1}>
            {t("settings.per")}
            </Grid>
            <Grid item xs={3}>
              <DropdownPicker
                value={challengePerUser.period}
                items={perRange}
                onChange={(item) => setChallengePerUser((prev) => ({ ...prev, period: item }))}
              />
            </Grid>
            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                onClick={() =>
                  onSubmit("challengePerUser", {
                    value: challengePerUser.value,
                    period: challengePerUser?.period?.value,
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
        <Grid item xs={6} md={4}>
          <GridRow>
            <SettingName>{t("settings.maximum_km_per_trip")}</SettingName>
            <SettingDetails>{t("settings.maximum_km_per_details")}</SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={6} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <TextField
                value={kmPerTrip}
                onChange={(event) => setKmPerTrip(event.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={4}></Grid>
            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                onClick={() => onSubmit("kmPerTrip", kmPerTrip)}
              >
                {t("forms.submit")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={6} md={4}>
          <GridRow>
            <SettingName>{t("settings.maximum_manual_trip")}</SettingName>
            <SettingDetails>{t("settings.maximum_manual_trip_details")}</SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={6} md={8}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={2}>
              <TextField
                value={manualTrips.value}
                onChange={(event) =>
                  setManualTrips((prev) => ({ ...prev, value: event.target.value }))
                }
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={1}>
            {t("settings.per")}
            </Grid>
            <Grid item xs={3}>
              <DropdownPicker
                value={manualTrips.period}
                items={perRange}
                onChange={(item) => setManualTrips((prev) => ({ ...prev, period: item }))}
              />
            </Grid>
            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                onClick={() =>
                  onSubmit("manualTrips", {
                    value: manualTrips.value,
                    period: manualTrips?.period?.value,
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
              />
            </Grid>
            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                onClick={() =>
                  onSubmit("transactionsOfUserPerPeriod", {
                    value: userTransactionsPerPeriod.value,
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
      <Toast />
    </Wrapper>
  );
};

export default OrganizationAppSettings;
