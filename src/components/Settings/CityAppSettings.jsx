import { useState, useEffect, useMemo, useCallback } from "react";
import { Checkbox, FormControlLabel, Grid, TextField } from "@material-ui/core";
import gpColors from "constants/gpColors";
import { useTranslation, Trans } from "react-i18next";
import styled from "styled-components";
import DropdownPicker from "atomicComponents/DropDown";
import { AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import { Button } from "reactstrap";
import Toast, { toast } from "shared/components/Toast";
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

const Spacer = () => {
  return (
    <div style={{ margin: '10px 0' }}>
      <hr style={{
        border: 'none',
        borderTop: '1px solid #ccc',
        marginBottom: 50
      }} />
    </div>
  );
};


const CityAppSettings = ({ cityId, disabled }) => {
  const { t } = useTranslation("common");

  const [pointsPerSession, setPointsPerSession] = useState("");
  const [manualTrips, setManualTrips] = useState({
    value: "",
    period: null,
  });
  const [challengePerUser, setChallengePerUser] = useState({
    value: "",
    period: null,
  });

  const [c18_admin_email_order, setAdminEmailOrder] = useState("");
  const [c18_admin_email, setAdminEmail] = useState("");
  const [c14_greenpoint_coefficient, setGreenpointsCoefficient] = useState("");
  const [c16_invite_organisation, setInviteOrganisation] = useState("");
  const [u7_control_points, setControlPoints] = useState({ limitGreenpointToControlPoints: false, limitedCoefficient: 1, granted: false });

  const { limitSettings } = cityHooks.useFetchCityLimitSettings(cityId);
  const updateSettings = cityHooks.useUpdateCityLimitSettings(cityId);

  const { citizenLimitSettings } = cityHooks.useFetchCitizenLimitSettings(cityId);
  const updateCitizenSettings = cityHooks.useUpdateCitizenLimitSettings(cityId);

  useEffect(() => {

    if (citizenLimitSettings) {
      const {
        u7_control_points,
      } = citizenLimitSettings;

      if (u7_control_points) {

        setControlPoints(u7_control_points)

      }
    }


    if (limitSettings) {
      const {
        c13_challenge_period,
        pointsPerSession,
        c11_maximum_session,
        c14_greenpoint_coefficient,
        c16_invite_organisation,

        c18_admin_email
      } = limitSettings;

      if (c13_challenge_period) {
        const { period, value } = c13_challenge_period;
        const label = t(AVAILABLE_FILTER_TYPES[c13_challenge_period.period]?.label);

        setChallengePerUser({ value, period: { value: period, label } });
      }

      if (pointsPerSession) {
        setPointsPerSession(pointsPerSession.value);
      }

      if (c18_admin_email) {
        setAdminEmailOrder(c18_admin_email.email_order)
      }

      if (c18_admin_email) {
        setAdminEmail(c18_admin_email.email)
      }

      if (c11_maximum_session) {
        const { period, value } = c11_maximum_session;
        const label = t(AVAILABLE_FILTER_TYPES[c11_maximum_session.period]?.label);

        setManualTrips({ value, period: { value: period, label } });
      }

      if (c14_greenpoint_coefficient) {
        setGreenpointsCoefficient(
          c14_greenpoint_coefficient.value
        );
      }

      if (c16_invite_organisation) {
        setInviteOrganisation(
          c16_invite_organisation.value
        );
      }


    }
  }, [limitSettings, citizenLimitSettings, t]);

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
    setGreenpointsCoefficient((prev) => ({ ...prev }))
  }, [perRange]);

  const onSubmit = useCallback(
    async (field, settings) => {
      try {
        if (field == "u7_control_points") {
          if (settings.limitedCoefficient == 0) {
            settings.limitedCoefficient = 1;
          }
          updateCitizenSettings(field, settings);
        } else {
          updateSettings(field, settings);
        }
        toast.success(t("settings.success"));
      } catch (error) {
        toast.error(t("settings.failure"));
        console.error("Failed to update organization settings", error);
      }
    },
    [t, updateSettings, updateCitizenSettings]
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
                disabled={disabled}
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
                  onSubmit("c13_challenge_period", {
                    granted: true,
                    value: Number(challengePerUser.value),
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
            <SettingName>{t("settings.maximum_number_of_points_per_session")}</SettingName>
            <SettingDetails>{t("settings.maximum_number_of_points_per_session_details")}</SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={6} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <TextField
                value={pointsPerSession}
                onChange={(event) => setPointsPerSession(event.target.value)}
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
                disabled={disabled}
                onClick={() => onSubmit("pointsPerSession", {
                  granted: true,
                  value: Number(pointsPerSession)
                })}
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
                disabled={disabled}
              />
            </Grid>
            {/* <Grid item xs={1}>
            {t("settings.per")}
            </Grid>
            <Grid item xs={3}>
              <DropdownPicker
                value={manualTrips.period}
                items={perRange}
                onChange={(item) => setManualTrips((prev) => ({ ...prev, period: item }))}
              />
            </Grid> */}
            <Grid item xs={4}></Grid>
            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                disabled={disabled}
                onClick={() =>
                  onSubmit("c11_maximum_session", {
                    granted: true,
                    value: Number(manualTrips.value),
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

            <SettingName>{t("settings.greenpoints_ceofficient")}</SettingName>
            <SettingDetails>{t("settings.greenpoints_ceofficient_details")}</SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={6} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <TextField
                value={c14_greenpoint_coefficient}
                onChange={(event) => setGreenpointsCoefficient(event.target.value)}
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
                disabled={disabled}
                onClick={() => onSubmit("c14_greenpoint_coefficient", {
                  granted: true,
                  value: Number(c14_greenpoint_coefficient)
                })}
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
              {t("settings.order_admin_email")}
            </SettingName>
            <SettingDetails>
              <Trans i18nKey="settings.order_admin_email_details">
                {t("settings.order_admin_email_details")}
              </Trans>
            </SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={6} >
              <TextField
                value={c18_admin_email_order}
                onChange={(event) => setAdminEmailOrder(event.target.value)}
                variant="outlined"
                size="small"
                type="text"
                disabled={disabled}
              />
            </Grid>

            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                disabled={disabled}
                onClick={
                  c18_admin_email_order ?
                    () => onSubmit("c18_admin_email", {
                      granted: true,
                      email_order: String(c18_admin_email_order)
                    }) :
                    () => onSubmit("c18_admin_email", {
                      granted: false,
                      email_order: ""
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
              {t("settings.admin_email")}
            </SettingName>
            <SettingDetails>
              <Trans i18nKey="settings.admin_email_details">
                {t("settings.admin_email_details")}
              </Trans>
            </SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={6} >
              <TextField
                value={c18_admin_email}
                onChange={(event) => setAdminEmail(event.target.value)}
                variant="outlined"
                size="small"
                type="text"
                disabled={disabled}
              />
            </Grid>

            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                disabled={disabled}
                onClick={
                  c18_admin_email ?
                    () => onSubmit("c18_admin_email", {
                      granted: true,
                      email: String(c18_admin_email)
                    }) :
                    () => onSubmit("c18_admin_email", {
                      granted: false,
                      email: ""
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
            <SettingName>{t("settings.activate_order_admin_email")}</SettingName>
          </GridRow>
        </Grid>
        <Grid item xs={6} md={8}>

          <Grid item xs={2}>
            <FormControlLabel
              onChange={(event) =>
                setControlPoints((prev) => {
                  return { ...prev, granted: event.target.checked };
                })
              }
              control={
                <Checkbox checked={!!u7_control_points.granted} value={!!u7_control_points.granted} color="primary" />
              }
            />
          </Grid>


        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={6} md={4}>
          <GridRow>
            <SettingName>{t("settings.activate_user_report_admin_email")}</SettingName>
          </GridRow>
        </Grid>
        <Grid item xs={6} md={8}>

          <Grid item xs={2}>
            <FormControlLabel
              onChange={(event) =>
                setControlPoints((prev) => {
                  return { ...prev, granted: event.target.checked };
                })
              }
              control={
                <Checkbox checked={!!u7_control_points.granted} value={!!u7_control_points.granted} color="primary" />
              }
            />
          </Grid>
        </Grid>
      </Grid>
      <Spacer />
      <Grid container spacing={3}>
        <Grid item xs={6} md={4}>
          <GridRow>
            <SettingName>{t("settings.activate_control_points")}</SettingName>
            <SettingDetails>{t("settings.activate_control_points_details")}</SettingDetails>
          </GridRow>
        </Grid>
        <Grid item xs={6} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <FormControlLabel
                onChange={(event) =>
                  setControlPoints((prev) => {
                    return { ...prev, granted: event.target.checked };
                  })
                }
                control={
                  <Checkbox checked={!!u7_control_points.granted} value={!!u7_control_points.granted} color="primary" />
                }
              />
            </Grid>
            <Grid item xs={4}></Grid>
            <Grid item>
              <Button
                style={{ margin: 0 }}
                size="sm"
                color="primary"
                disabled={disabled}
                onClick={() => onSubmit("u7_control_points", u7_control_points)}
              >
                {t("forms.submit")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {u7_control_points.granted && (
        <Grid container spacing={3}>
          <Grid item xs={6} md={4}>
            <GridRow>
              <SettingName>{t("settings.limit_greenpoints_to_control_points")}</SettingName>
              <SettingDetails>{t("settings.limit_greenpoints_to_control_points_details")}</SettingDetails>
            </GridRow>
          </Grid>
          <Grid item xs={6} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={2}>
                <FormControlLabel
                  onChange={(event) => setControlPoints((prev) => ({ ...prev, limitGreenpointToControlPoints: event.target.checked }))}
                  control={
                    <Checkbox
                      checked={!!u7_control_points.limitGreenpointToControlPoints}
                      value={!!u7_control_points.limitGreenpointToControlPoints}
                      color="primary"
                    />
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {u7_control_points.granted && !u7_control_points.limitGreenpointToControlPoints && (
        <Grid container spacing={3}>
          <Grid item xs={6} md={4}>
            <GridRow>
              <SettingName>{t("settings.control_point_coefficient")}</SettingName>
              <SettingDetails><span className="bold-text">❗IMPORTANT❗</span></SettingDetails><SettingDetails>{t("settings.control_point_coefficient_details")}</SettingDetails>
            </GridRow>
          </Grid>
          <Grid item xs={6} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={2}>
                <TextField
                  value={u7_control_points.limitedCoefficient || 1}
                  onChange={(event) => setControlPoints((prev) => ({ ...prev, limitedCoefficient: Number(event.target.value) }))}
                  variant="outlined"
                  size="small"
                  type="number"
                  InputProps={{
                    inputProps: {
                      min: 0,
                      step: 0.01,
                    }
                  }}
                  disabled={disabled}
                />
              </Grid>
              {/* <Grid item xs={4}></Grid>
              <Grid item>
                <Button
                  style={{ margin: 0 }}
                  size="sm"
                  color="primary"
                  disabled={disabled}
                  onClick={() => onSubmit("u7_control_points", u7_control_points)}
                >
                  {t("forms.submit")}
                </Button>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      )}
      <Toast />
    </Wrapper>
  );
};

export default CityAppSettings;
