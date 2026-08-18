import { io } from "socket.io-client";

const getSocketAuth = () => {
    try {
        return { token: localStorage.getItem("authToken") || "" };
    } catch {
        return { token: "" };
    }
};

const socket = io("https://lucky-1-6ma5.onrender.com", {
    transports: ["websocket"],
    withCredentials: true,
    auth: getSocketAuth(),
});

export default socket;
