import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
`;

const ButtonItem = styled.div`
  font-size: 18px;
  text-transform: capitalize;
  padding: 0.7rem 1rem;
  cursor: pointer;

  &:hover{
    border-color: #f0f0f0;
  }

  border-bottom: 4px solid ${({isActive, buttonColor}) => isActive ? `${buttonColor || '#50b6e2'} !important` : 'transparent'};
`;

const TabsButton = ({ items, onChange, activeItem, buttonColor }) => {
  return (
    <Wrapper>
      {items.map((item) => <ButtonItem key={item.label} onClick={() => onChange(item)} isActive={activeItem?.label === item?.label} buttonColor={buttonColor}>{item.label}</ButtonItem>)}
    </Wrapper>
  )
};

export default TabsButton;
