"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import { useAuth } from "@/libs/auth";
import useGetWarehouses from "@/libs/getAllWarehouse";
import Notification from "@/components/Notification";
import WarehouseBalance from "./WarehouseBalance";
import RevenueReport from "./RevenueReport";
import MutationHistory from "./MutationHistory";
import LogActivity from "./LogActivity";

const SummaryContent = () => {
    const { user } = useAuth({ middleware: "auth" });

    const [account, setAccount] = useState(null);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [errors, setErrors] = useState([]);
    const { warehouses, warehousesError } = useGetWarehouses();

    const fetchAccount = async (url = "/api/get-all-accounts") => {
        try {
            const response = await axios.get(url);
            setAccount(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, []);
    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="grid grid-cols-1 gap-4">
                <WarehouseBalance />
                <RevenueReport />
                <MutationHistory account={account} notification={(type, message) => setNotification({ type, message })} user={user} />
                <LogActivity warehouses={warehouses} />
            </div>
        </>
    );
};

export default SummaryContent;
