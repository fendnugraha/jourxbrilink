"use client";

import Link from "next/link";
import { useAuth } from "@/libs/auth";

const LoginLinks = () => {
    const { user } = useAuth({ middleware: "guest" });

    return (
        <div className="">
            {user ? (
                <Link href="/dashboard" className="bg-blue-600 py-2 px-6 text-xl rounded-2xl text-white">
                    Dashboard
                </Link>
            ) : (
                <>
                    <Link href="/login" className="bg-blue-600 py-2 px-6 text-xl rounded-2xl text-white">
                        Login
                    </Link>
                </>
            )}
        </div>
    );
};

export default LoginLinks;
