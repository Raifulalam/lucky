import { io } from "socket.io-client";

const socket = io("https://lucky-1-6ma5.onrender.com", {
    transports: ["websocket"],
    withCredentials: true,
});

export default socket;