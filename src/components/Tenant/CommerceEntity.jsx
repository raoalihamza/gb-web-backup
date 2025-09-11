import CardBox from 'atomicComponents/CardBox';
import gpColors from 'constants/gpColors';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${gpColors.white};
`;

const Amount = styled.div`
  font-size: 60px;
  margin-right: 12px;
`;

const Title = styled.div`
  font-size: 16px;
`;

const CommerceEntity = ({ amount, color, icon, title, cursor, onClick = () => {}, disabled }) => {
  return (
    <CardBox
      style={{ backgroundColor: color, pointerEvents: disabled ? 'none' : 'auto'  }}
      padding="0px 20px 4px 20px"
      onClick={onClick}
      cursor={cursor}
    >
      <Wrapper>
        <Amount>{amount}</Amount>
        <div>
          {icon}
          <Title>{title}</Title>
        </div>
      </Wrapper>
    </CardBox>
  );
};

export default CommerceEntity;
