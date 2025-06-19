"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/libs/auth";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    const { login, error: authError } = useAuth({
        middleware: "guest",
        redirectIfAuthenticated: "/transaction",
    });

    useEffect(() => {
        if (authError) {
            setStatus(authError.message);
        }
    }, [authError]);

    useEffect(() => {
        if (router.reset?.length > 0 && errors.length === 0) {
            setStatus(atob(router.reset));
        } else {
            setStatus(null);
        }
    }, [router.reset, errors]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login({ email, password, setErrors, setStatus, setMessage, setLoading });
    };

    return (
        <div className="w-1/2 flex items-center flex-col">
            <h1 className="text-4xl font-bold text-slate-500 mb-4">THREEKOMUNIKA</h1>
            <h1>Login to your account</h1>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 mt-4 mb-2">
                    <input
                        className="px-6 py-3 rounded-2xl focus:border outline-none focus:border-orange-500/25 w-80 bg-slate-300 text-orange-500"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="px-6 py-3 rounded-2xl focus:border outline-none focus:border-orange-500/25 w-80 bg-slate-300 text-orange-500"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    disabled={loading || message === "Login successful!"}
                    className="px-4 py-2 w-40 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 cursor-pointer disabled:bg-orange-300 disabled:cursor-not-allowed"
                    type="submit"
                >
                    {loading || message === "Login successful!" ? "Loging in ..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
