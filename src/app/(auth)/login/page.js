"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/libs/auth";
import Image from "next/image";
import Loading from "./loading";
import { SatelliteDishIcon } from "lucide-react";

const LoginPage = () => {
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
        if (authError?.code === "ERR_NETWORK") {
            setStatus("Error Network: Unable to reach the server. Retrying connection...");
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
        <>
            <div className="bg-white p-8 rounded-2xl drop-shadow-xl shadow-orange-500 w-full sm:w-[500px] md:1/3">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h2>
                {authError?.code === "ERR_NETWORK" && (
                    <div className="flex flex-col justify-center items-center mb-4">
                        <SatelliteDishIcon size={50} className="animate-pulse text-red-500" />
                        <p className="text-sm font-light text-red-500 animate-pulse mt-4">{status}</p>
                    </div>
                )}
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
                            disabled={loading || message === "Login successful!" || authError?.code === "ERR_NETWORK"}
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
                            disabled={loading || message === "Login successful!" || authError?.code === "ERR_NETWORK"}
                            required
                        />
                        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                    </div>
                    <button
                        disabled={loading || message === "Login successful!" || authError?.code === "ERR_NETWORK"}
                        className="px-6 py-3 mt-2 w-full bg-blue-700 text-white rounded-2xl hover:bg-blue-600 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                        type="submit"
                    >
                        {authError?.code === "ERR_NETWORK" ? "Unable to login" : loading || message === "Login successful!" ? "Loging in ..." : "Login"}
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
