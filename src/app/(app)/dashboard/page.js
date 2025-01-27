"use client";
import { logout } from "@/lib/auth";

const Dashboard = () => {
    const handleLogout = async () => {
        try {
            await logout(); // Use the imported logout utility
            window.location.href = "/"; // Redirect to login after successful logout
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Failed to log out. Please try again."); // User-friendly error message
        }
    };

    return (
        <>
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <button
                onClick={handleLogout}
                className="bg-slate-800 text-white rounded-md px-4 py-2 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
                Logout
            </button>
        </>
    );
};

export default Dashboard;
