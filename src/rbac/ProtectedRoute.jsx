import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ roles, children }) => {

    const userDetails = useSelector((state) => state.form.userDetails);
    return roles.includes(userDetails?.role) ?
        children :
        <Navigate to="/unauthorized" />
}

export default ProtectedRoute