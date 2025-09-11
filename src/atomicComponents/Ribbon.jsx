import gpColors from 'constants/gpColors';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: absolute;
  height: 30px;
  ${({ position }) => position};
  min-width: 110px;
  text-align: center;
  text-transform: capitalize;
`;

const RibbonInner = styled.div`
  background-color: ${({ color }) => color};
  color: ${gpColors.white};
  padding: 4px 0px;
`;

const Ribbon = ({ color, content, position }) => {
 return (
   <Wrapper position={position}>
    <RibbonInner color={color}>{content}</RibbonInner>
  </Wrapper>
 )
};

export default Ribbon;
