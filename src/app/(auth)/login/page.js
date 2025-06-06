"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/libs/auth";
import Image from "next/image";
import Loading from "./loading";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    const { login } = useAuth({
        middleware: "guest",
        redirectIfAuthenticated: "/transaction",
    });

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
        <>
            <div className="bg-white p-8 rounded-2xl drop-shadow-xl shadow-orange-500 w-full sm:w-[500px] md:1/3">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-3 bg-gray-100 border border-slate-300 rounded-lg focus:ring focus:ring-indigo-500 outline-none"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="off"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-3 bg-gray-100 border border-slate-300 rounded-lg focus:ring focus:ring-indigo-500 outline-none"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="off"
                            required
                        />
                        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading || message === "Login successful!"}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ transition: "all 0.3s ease-in-out" }}
                    >
                        {loading || message === "Login successful!" ? "Loging in ..." : "Login"}
                    </button>
                </form>
                <p className="text-center mt-6 text-xs">
                    &copy; 2022 Jour Apps by <Image src="/eightnite.png" alt="Logo" width={60} height={60} className="inline-block mx-1 w-auto" /> All rights
                    reserved
                </p>
            </div>

            {/* <div className="italics font-bold fixed bottom-5 right-8">{message && <p className="text-green-500 text-xs">{message}</p>}</div> */}
            {message && <Loading />}
        </>
    );
};

export default LoginPage;
