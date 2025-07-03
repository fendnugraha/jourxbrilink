"use client";
import { useState, useEffect } from "react";
import WarehouseBalance from "./components/WarehouseBalance";
import RevenueReport from "./components/RevenueReport";
import MutationHistory from "./components/MutationHistory";
import axios from "@/libs/axios";
import { useAuth } from "@/libs/auth";
import LogActivity from "./components/LogActivity";
import useGetWarehouses from "@/libs/getAllWarehouse";
import MainPage from "../main";
import Notification from "@/components/Notification";

const SummaryPage = () => {
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
        <MainPage headerTitle="Summary">
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <div className="grid grid-cols-1 gap-4">
                    <WarehouseBalance />
                    <RevenueReport />
                    <MutationHistory account={account} notification={(type, message) => setNotification({ type, message })} user={user} />
                    <LogActivity warehouses={warehouses} />
                </div>
            </div>
        </MainPage>
    );
};

export default SummaryPage;
