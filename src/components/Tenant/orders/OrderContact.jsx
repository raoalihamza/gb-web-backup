import { Typography } from '@material-ui/core';
import gpColors from 'constants/gpColors';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Contact = styled.div`
  color: ${gpColors.darkBlue}; 
`;

const OrderContact = ({ customer, deliveryAddress }) => {
 return (
   <Wrapper>
      <Contact>
        <Typography variant="subtitle1" component="div">{customer.name}</Typography>
        <Typography variant="subtitle2" component="div">{customer.email}</Typography>
        <Typography variant="subtitle2" component="div">{deliveryAddress}</Typography>
      </Contact>
   </Wrapper>
 )
};

export default OrderContact;
