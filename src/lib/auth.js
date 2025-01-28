import axios from "./axios";

export const login = async (email, password) => {
    await axios.get("/sanctum/csrf-cookie");
    const response = await axios.post("/login", {
        email,
        password,
    });
    return response.data;
};

export const logout = async () => {
    await axios.get("/sanctum/csrf-cookie");
    const response = await axios.post("/logout");
    return response.data;
};

export const register = async (email, password) => {
    const response = await axios.post("/register", {
        email,
        password,
    });
    return response.data;
};

export const getUser = async () => {
    const response = await axios.get("/user");
    return response.data;
};
