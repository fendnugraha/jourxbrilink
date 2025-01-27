"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "./auth";

export default function withAuth(Component) {
    return function ProtectedRoute(props) {
        const [loading, setLoading] = useState(true);
        const [user, setUser] = useState(null);
        const router = useRouter();

        useEffect(() => {
            async function checkAuth() {
                try {
                    const userData = await getUser();
                    setUser(userData);
                } catch (error) {
                    router.push("/");
                } finally {
                    setLoading(false);
                }
            }
            checkAuth();
        }, [router]);

        if (loading) return <p>Loading...</p>;
        return <Component {...props} user={user} />;
    };
}
