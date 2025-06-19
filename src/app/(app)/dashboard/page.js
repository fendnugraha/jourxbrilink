"use client";
import { useEffect, useState } from "react";
import DailyDashboard from "./components/DailyDashboard";
import { useAuth } from "@/libs/auth";
import CashBankMutation from "./components/CashBankMutation";
import VoucherSalesTable from "./components/VoucherSalesTable";
import ExpenseTable from "./components/ExpenseTable";
import useGetWarehouses from "@/libs/getAllWarehouse";
import MainPage from "../main";
import Notification from "@/components/Notification";

const Dashboard = () => {
    const { user } = useAuth({ middleware: "auth" });
    const userRole = user?.role?.role;

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const warehouse = user?.role?.warehouse_id;
    const warehouseName = user?.role?.warehouse?.name;

    const [loading, setLoading] = useState(false);
    const { warehouses, warehousesError } = useGetWarehouses();

    return (
        <MainPage headerTitle="Dashboard">
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <DailyDashboard warehouse={warehouse} warehouses={warehouses} userRole={userRole} />
                <CashBankMutation
                    warehouse={warehouse}
                    warehouses={warehouses}
                    userRole={userRole}
                    notification={(type, message) => setNotification({ type, message })}
                />
                <VoucherSalesTable warehouse={warehouse} warehouseName={warehouseName} warehouses={warehouses} userRole={userRole} />
                <ExpenseTable warehouse={warehouse} warehouses={warehouses} userRole={userRole} />
            </div>
        </MainPage>
    );
};

export default Dashboard;
