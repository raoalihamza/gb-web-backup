import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import HealthBar from "shared/components/HealthBar";
import { DATE_FORMATS, formatDate } from "utils/dateUtils";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const UserStats = ({ userProfile }) => {
  const { t } = useTranslation("common");
  const { sessionListLastUpdatedAt, mockGreenpoint = 0, healthPoint = 0, mockExperiencePoint = 0, level = 1, privacyPolicyTermsUse, controlPoints, carpooling } =
    userProfile;

  const lastTripDate = useMemo(() => {
    const date = sessionListLastUpdatedAt;
    if (!date) return;

    return formatDate(date.toDate(), DATE_FORMATS.DAY_MM_DD);
  }, [sessionListLastUpdatedAt]);

  const fixedGreenPoints = useMemo(() => mockGreenpoint?.toFixed(0), [mockGreenpoint]);

  return (
    <div>
      <div>
        {t("account.profile.last_trip_date")} : {lastTripDate}
      </div>
      <div>
        {t("challenge.points")} : {fixedGreenPoints ?? 0}
      </div>
      <Wrapper>
        {t("account.profile.health_point")} : <HealthBar hearts={5} health={healthPoint} />
      </Wrapper>
      <div>
        {t("account.profile.experience_points")} : {(mockExperiencePoint ?? 0).toFixed(0)}
      </div>
      <div>
        {t("account.profile.level")} : {level}
      </div>
      <div>
        {t("account.profile.approved_privacy_policy")} : {privacyPolicyTermsUse ? "OUI" : "NON"}
      </div>
      {controlPoints != undefined ?
        <>
          <div>
            {`${t("global.control_points")} ${t("global.home")}`} : {`${Object.keys(controlPoints.home).length !== 0 == false ? t('account.profile.no') : t('account.profile.yes')}`}
          </div>
          <div>
            {`${t("global.control_points")} ${t("global.work")}`}: {`${Object.keys(controlPoints.workplace).length !== 0 == false ? t('account.profile.no') : t('account.profile.yes')}`}
          </div>
          <div>
            {`${t("global.control_points")} ${t("global.academic")}`} : {`${Object.keys(controlPoints.academic).length !== 0 == false ? t('account.profile.no') : t('account.profile.yes')}`}
          </div>
        </> : <></>

      }

      <div>
        {t("global.carpool")} : {carpooling ? carpooling.associateCarpooler ? carpooling.associateCarpooler[0] != null ? t('account.profile.yes') : t('account.profile.no') : t('account.profile.no') : t('account.profile.no')}
      </div>
    </div>
  );
};

export default UserStats;
