"use client";
import { useState } from "react";
import { useAuth } from "@/libs/auth";
import useGetWarehouses from "@/libs/getAllWarehouse";
import Notification from "@/components/Notification";
import DailyDashboard from "./DailyDashboard";
import CashBankMutation from "./CashBankMutation";
import VoucherSalesTable from "./VoucherSalesTable";
import ExpenseTable from "./ExpenseTable";
import BankAccountDiff from "./BankAccountDiff";

const DashboardContent = () => {
    const { user } = useAuth({ middleware: "auth" });
    const userRole = user?.role?.role;

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const warehouse = user?.role?.warehouse_id;
    const warehouseName = user?.role?.warehouse?.name;

    const { warehouses, warehousesError } = useGetWarehouses();
    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="grid grid-cols-1 gap-4">
                <DailyDashboard warehouse={warehouse} warehouses={warehouses} userRole={userRole} />
                <CashBankMutation warehouse={warehouse} warehouses={warehouses} userRole={userRole} notification={setNotification} />
                <VoucherSalesTable warehouse={warehouse} warehouseName={warehouseName} warehouses={warehouses} userRole={userRole} />
                <ExpenseTable warehouse={warehouse} warehouses={warehouses} userRole={userRole} />
                {/* <BankAccountDiff /> */}
            </div>
        </>
    );
};

export default DashboardContent;
