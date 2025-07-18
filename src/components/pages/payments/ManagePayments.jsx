import { useSelector } from "react-redux";
import PurchaseCredit from './PurchaseCredit'
import PendingConfirmation from './PendingConfirmation'
import Subscription from './Subscription'
function ManagePayments() {
  const userDetails = useSelector((state) => state.form.userDetails);
  console.log(userDetails);
  const confirmationStatus = [
    'created', 'pending', 'authenticated'
  ];
  if (userDetails.subscription?.status === 'active') {
    return <Subscription />;
  } else if (confirmationStatus.includes(userDetails.subscription?.status)) {
    return <PendingConfirmation />;
  } else {
    return <PurchaseCredit />;
  }
}

export default ManagePayments;
