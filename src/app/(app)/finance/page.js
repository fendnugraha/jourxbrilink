"use client";
import { useAuth } from "@/libs/auth";
import Payable from "./components/Payable";
import { useState } from "react";
import MainPage from "../main";
import Notification from "@/components/Notification";

const Finance = () => {
    const { user } = useAuth({ middleware: "auth" });

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const warehouse = user?.role?.warehouse_id;

    return (
        <MainPage headerTitle="Summary">
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Payable notification={(message) => setNotification(message)} />
                </div>
            </div>
        </MainPage>
    );
};

export default Finance;
