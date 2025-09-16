import styled from "styled-components";
import FilterDatePicker from "../../atomicComponents/FilterDatePicker";
import StatsDatePicker from "../../atomicComponents/StatsDatePicker";
import { useAuth } from "../../shared/providers/AuthProvider";
import { ItemsPicker } from "atomicComponents/ItemsPicker";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
  display: flex;
`;

const projectId = import.meta.env.VITE__FIREBASE_PROJECT_ID;

const DateSelect = ({
  filterBy,
  setFilterBy,
  startDate,
  onChange,
  logType,
  challengeName,
  challenges,
  setChallenge,
  onChangeEndDate,
  endDate,
  filterTypes,
}) => {
  const [user, details] = useAuth();
  const [t] = useTranslation("common");

  return (
    <Wrapper>
      {logType === "challenges" ? (
        <ItemsPicker
          items={challenges}
          emptyMessage={t("global.no_challenges")}
          selectedItemName={challengeName}
          setItem={setChallenge}
        />
      ) : (
        <StatsDatePicker
          setStartDate={onChange}
          startDate={startDate}
          setEndDate={onChangeEndDate}
          endDate={endDate}
          logType={logType}
        />
      )}
      {/* {projectId == "defisansautosolo-17ee7" &&
      details.role == "organisation" ? (
        <div></div>
      ) : ( */}
        <FilterDatePicker setFilterBy={setFilterBy} filterBy={filterBy} filterTypes={filterTypes}/>
      {/* )} */}
    </Wrapper>
  );
};

export default DateSelect;
