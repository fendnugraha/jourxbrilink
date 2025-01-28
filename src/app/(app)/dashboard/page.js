"use client";
import { useAuth } from "@/libs/auth";
const Dashboard = () => {
    const { logout } = useAuth({
        middleware: "auth",
        redirectIfAuthenticated: "/login",
    });

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div>
            <h1 className="text-5xl font-bold mb-4">Dashboard</h1>
            <button
                onClick={handleLogout}
                className="bg-slate-800 text-white rounded-md px-4 py-2 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
