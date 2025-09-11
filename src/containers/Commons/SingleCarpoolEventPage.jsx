import { Card } from "reactstrap";
import usersHooks from "hooks/users.hooks";
import commonHooks from "hooks/common.hooks";
import { useParams } from "react-router-dom";
import CarpoolEventForm from "./components/CarpoolEventForm";
import styled from "styled-components";
import CarpoolEventMatchesTablesInfo from "./components/CarpoolEventMatchesTablesInfo";
import LoadingIcon from "mdi-react/LoadingIcon";
import CarpoolEventMatchesMapInfo from "./components/CarpoolEventMatchesMapInfo";

const Wrapper = styled.div``;

const LoadingIndicatorContainer = styled.div`
  position: absolute;
  z-index: 101;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(5, 5, 5, 0.1);
`;

const SingleCarpoolEventPage = () => {
  const params = useParams();
  const eventId = params?.id;
  const { details, userId } = usersHooks.useExternalUser();
  const { carpoolEvent, handleAddCsv, onSubmitEventForm, isLoading, errors } = commonHooks.useSingleCarpoolEvent({
    role: details.role,
    ownerId: userId,
    eventId,
  });

  const {
    carpoolRequests,
    carpoolMatchesUniqueByGroupId,
    toggleCarpoolMatchMapApperance,
    toggleCarpoolRequestMapApperance,
  } = commonHooks.useCarpoolEventMatchingData({
    eventId,
  });

  return (
    <Wrapper>
      <Card style={{ height: "auto", backgroundColor: "white", padding: 0 }}>
        <CarpoolEventForm
          errors={errors}
          initialValues={carpoolEvent}
          handleAddCsv={handleAddCsv}
          onSubmit={onSubmitEventForm}
          isLoading={isLoading}
        />
      </Card>

      {(carpoolRequests.length > 0 || carpoolEvent?.errorUsers?.length > 0) && (
        <CarpoolEventMatchesTablesInfo
          carpoolMatches={carpoolMatchesUniqueByGroupId}
          carpoolRequests={carpoolRequests}
          toggleCarpoolMatchMapApperance={toggleCarpoolMatchMapApperance}
          toggleCarpoolRequestMapApperance={toggleCarpoolRequestMapApperance}
          errorUsers={carpoolEvent?.errorUsers}
        />
      )}
      {carpoolRequests.length > 0 && (
        <CarpoolEventMatchesMapInfo
          carpoolEvent={carpoolEvent}
          carpoolMatches={carpoolMatchesUniqueByGroupId}
          carpoolRequests={carpoolRequests}
          toggleCarpoolMatchMapApperance={toggleCarpoolMatchMapApperance}
          toggleCarpoolRequestMapApperance={toggleCarpoolRequestMapApperance}
        />
      )}

      {isLoading && (
        <LoadingIndicatorContainer>
          <div className="panel__refresh">
            <LoadingIcon />
          </div>
        </LoadingIndicatorContainer>
      )}
    </Wrapper>
  );
};

export default SingleCarpoolEventPage;
