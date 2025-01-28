"use client";
import useSWR from "swr";
import axios from "./axios";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter();
    const params = useParams();

    const {
        data: user,
        error,
        mutate,
    } = useSWR("/api/user", () =>
        axios
            .get("/api/user")
            .then((res) => res.data)
            .catch((error) => {
                if (error.response.status !== 409) throw error;

                router.push("/");
            })
    );

    const csrf = () => axios.get("/sanctum/csrf-cookie");

    const login = async ({ setErrors, setStatus, ...props }) => {
        await csrf();

        setErrors([]);
        setStatus(null);

        axios
            .post("/login", props)
            .then(() => mutate())
            .catch((error) => {
                if (error.response.status !== 422) throw error;

                setErrors(error.response.data.errors);
            });
    };

    const logout = async () => {
        if (!error) {
            await axios.post("/logout").then(() => mutate());
        }

        window.location.pathname = "/";
    };

    useEffect(() => {
        if (middleware === "guest" && redirectIfAuthenticated && user) router.push(redirectIfAuthenticated);

        if (middleware === "auth" && !user?.email_verified_at) router.push("/");

        // if (window.location.pathname === "/" && user?.email_verified_at) router.push(redirectIfAuthenticated);
        if (middleware === "auth" && error) logout();
    });

    return {
        user,
        error,
        login,
        logout,
    };
};
