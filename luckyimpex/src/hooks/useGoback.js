// hooks/useGoBack.js
import { useNavigate } from "react-router-dom";

const useGoBack = (fallback = "/") => {
    const navigate = useNavigate();

    return () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(fallback, { replace: true });
        }
    };
};

export default useGoBack;
