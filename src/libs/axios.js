import Axios from "axios";

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN", // wajib
    xsrfHeaderName: "X-XSRF-TOKEN", // wajib
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    withXSRFToken: true,
});

export default axios;
