"use client";
import Header from "@/app/(app)/Header";
import { useEffect, useState } from "react";
import Notification from "@/components/notification";
import axios from "@/libs/axios";
import DailyDashboard from "./components/DailyDashboard";
import { useAuth } from "@/libs/auth";
import CashBankMutation from "./components/CashBankMutation";

const Dashboard = () => {
    const { user } = useAuth({ middleware: "auth" });

    const [notification, setNotification] = useState("");
    const warehouse = user?.role?.warehouse_id;

    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const fetchWarehouses = async (url = "/api/get-all-warehouses") => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setWarehouses(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);
    return (
        <>
            {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
            <div className="">
                {/* <h1 className="text-2xl font-bold mb-4">Point of Sales - Add to Cart</h1> */}
                <Header title={"Dashboard"} />
                <div className="py-8">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <DailyDashboard user={user} />
                        <CashBankMutation warehouse={warehouse} warehouses={warehouses} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
