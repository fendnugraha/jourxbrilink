import Axios from "axios";

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        "X-XSRF-TOKEN": localStorage.getItem("XSRF-TOKEN"),
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    withCredentials: true,
    withXSRFToken: true,
});

export default axios;
