import { useSelector } from "react-redux";
import {ROLE_PERMISSIONS} from "./permissions";

const Can = ({ permission, children }) => {
    const user = useSelector((state) => state.form.userDetails);
    const permissions = ROLE_PERMISSIONS[user?.role] || {};
    return (
        permissions[permission] ? children : null
    );
}

export default Can