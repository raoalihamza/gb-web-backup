import React from 'react';
import styled from 'styled-components';

import { Card } from '@material-ui/core';

const Wrapper = styled.div`
  padding: ${({ padding }) => padding};
  ${({ flex }) => flex && 'display: flex'};
  cursor: ${({ cursor }) => cursor || 'auto'};
`;

const StyledCard = styled(Card)`
  &.MuiCard-root {
    overflow: visible;
  }
`;

const CardBox = ({ children, style = {}, variant, padding = "30px", flex, wrapperStyle = {}, onClick, cursor}) => (
  <StyledCard variant={variant} style={style} onClick={onClick}>
    <Wrapper padding={padding} flex={flex} style={wrapperStyle} cursor={cursor}>
      {children}
    </Wrapper>
  </StyledCard>
);

export default CardBox;
