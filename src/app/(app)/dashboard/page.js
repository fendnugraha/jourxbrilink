"use client";
import Header from "@/app/(app)/Header";
import { useEffect, useState } from "react";
import Notification from "@/components/notification";
import axios from "@/libs/axios";
import DailyDashboard from "./components/DailyDashboard";
import { useAuth } from "@/libs/auth";
import CashBankMutation from "./components/CashBankMutation";
import VoucherSalesTable from "./components/VoucherSalesTable";
import ExpenseTable from "./components/ExpenseTable";
import { mutate } from "swr";
import useGetWarehouses from "@/libs/getAllWarehouse";

const Dashboard = () => {
    const { user } = useAuth({ middleware: "auth" });
    const userRole = user.role?.role;

    const [notification, setNotification] = useState("");
    const warehouse = user?.role?.warehouse_id;
    const warehouseName = user?.role?.warehouse?.name;

    const [loading, setLoading] = useState(false);
    const { warehouses, warehousesError } = useGetWarehouses();

    return (
        <>
            {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
            <div className="">
                {/* <h1 className="text-2xl font-bold mb-4">Point of Sales - Add to Cart</h1> */}
                <Header title={"Dashboard"} />
                <div className="py-8">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <DailyDashboard warehouse={warehouse} warehouses={warehouses} userRole={userRole} />
                        <CashBankMutation warehouse={warehouse} warehouses={warehouses} userRole={userRole} />
                        <VoucherSalesTable warehouse={warehouse} warehouseName={warehouseName} warehouses={warehouses} userRole={userRole} />
                        <ExpenseTable warehouse={warehouse} warehouses={warehouses} userRole={userRole} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
