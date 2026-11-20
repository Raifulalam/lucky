import { io } from "socket.io-client";

const getSocketAuth = () => {
    try {
        return { token: localStorage.getItem("authToken") || "" };
    } catch {
        return { token: "" };
    }
};

const socket = io("https://lucky-production-fbbefe81.up.railway.app", {
    transports: ["websocket"],
    withCredentials: true,
    auth: getSocketAuth(),
});

export default socket;
