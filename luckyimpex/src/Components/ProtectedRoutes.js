import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, role } = useUser();

    if (loading) return null; // or loader

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
