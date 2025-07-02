"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/libs/auth";
import Label from "@/components/Label";
import { SatelliteDishIcon } from "lucide-react";

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
        if (authError?.code === "ERR_NETWORK") {
            setStatus("Error Network: Unable to reach the server. Trying to reconnect, please wait...");
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
            <div className="w-1/2 flex items-center flex-col">
                <h1 className="text-3xl/9 sm:text-4xl font-bold text-slate-500 mb-4">
                    THREE<span className="text-orange-500/50 font-light">KOMUNIKA</span>
                </h1>

                {authError?.code === "ERR_NETWORK" ? (
                    <>
                        <SatelliteDishIcon size={100} className="animate-pulse text-red-500" />
                        <p className="text-sm font-light text-red-500 animate-pulse mt-4">{status}</p>
                    </>
                ) : (
                    <h1 className="text-sm font-light text-slate-500">Login to your account</h1>
                )}
                <form onSubmit={handleSubmit} hidden={authError?.code === "ERR_NETWORK"}>
                    <div className="flex flex-col gap-2 my-4">
                        <div>
                            <Label>Email address</Label>
                            <input
                                className="px-6 py-3 rounded-xl outline-1 outline-gray-300/50 focus:outline-orange-500 w-80 sm:w-96 bg-slate-200 text-orange-500"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading || message === "Login successful!" || authError?.code === "ERR_NETWORK"}
                            />
                        </div>
                        <div>
                            <Label>Password</Label>
                            <input
                                className="px-6 py-3 rounded-xl outline-1 outline-gray-300/50 focus:outline-orange-500 w-80 sm:w-96 bg-slate-200 text-orange-500"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading || message === "Login successful!" || authError?.code === "ERR_NETWORK"}
                            />
                        </div>
                    </div>
                    <button
                        disabled={loading || message === "Login successful!" || authError?.code === "ERR_NETWORK"}
                        className="px-6 py-3 mt-2 w-full bg-blue-700 text-white rounded-2xl hover:bg-blue-600 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                        type="submit"
                    >
                        {authError?.code === "ERR_NETWORK" ? "Unable to login" : loading || message === "Login successful!" ? "Loging in ..." : "Login"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default Login;
