"use client";
import { useAuth } from "@/libs/auth";
import Navigation from "./navigation";
import AppLoading from "./loading";

const AppLayout = ({ children }) => {
    const { user } = useAuth({ middleware: "auth" });
    if (!user) {
        <AppLoading />;
    }
    return (
        <div className="flex h-screen overflow-hidden">
            <Navigation />
            <div className="flex-1">{children}</div>
        </div>
    );
};

export default AppLayout;
