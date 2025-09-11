import React from "react";
import styled from "styled-components";
import ShareLink from "shared/components/ShareLink";
import { useAuth } from "shared/providers/AuthProvider";
import { routes } from "containers/App/Router";

const Wrapper = styled.div`
  padding-bottom: 12px;
`;

const Manage = ({entity, id}) => {
  const [_, details] = useAuth();
  return (
    <Wrapper>
      <ShareLink
        link={`${window.location.origin}${routes.register.entity.replace(
          ":entity",
          entity
        )}?cityId=${id || details.id}`}
        entity={entity}
      />
    </Wrapper>
  );
};

export default Manage;
