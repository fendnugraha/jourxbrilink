"use client";
import { useAuth } from "@/libs/auth";
import Loading from "./loading";

export default function AppLayout({ children }) {
    const { user } = useAuth({ middleware: "auth" });

    if (!user) {
        return <Loading />;
    }
    return <div className="flex h-screen justify-center items-center flex-col">{children}</div>;
}
