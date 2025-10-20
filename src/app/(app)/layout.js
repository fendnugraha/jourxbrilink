"use client";
import { useAuth } from "@/libs/auth";
import Navigation from "./Navigation";
import Loading from "@/components/Loading";
import { getUserGeoLocation } from "@/libs/GetUserGeolocation";
import { useEffect } from "react";

const AppLayout = ({ children }) => {
    useEffect(() => {
        getUserGeoLocation(); // kirim sekali

        const interval = setInterval(() => {
            getUserGeoLocation();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);
    const { user, authLoading } = useAuth({ middleware: "auth" });
    if (authLoading || !user) {
        return <Loading />;
    }
    return (
        <div className="flex h-screen overflow-hidden">
            <Navigation user={user} />
            <div className="flex-1">{children}</div>
        </div>
    );
};

export default AppLayout;
