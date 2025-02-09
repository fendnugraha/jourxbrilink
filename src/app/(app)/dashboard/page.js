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
import useSWR, { mutate } from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const useGetWarehouses = () => {
    const {
        data: warehouses,
        error,
        isValidating,
    } = useSWR(`/api/get-all-warehouses`, fetcher, {
        revalidateOnFocus: false, // Refetch data when the window is focused
        dedupingInterval: 60000, // Avoid duplicate requests for the same data within 1 minute
        fallbackData: [], // Optional: you can specify default data here while it's loading
    });

    // Handle loading, errors, and data
    if (error) return { error: error.response?.data?.errors || ["Something went wrong."] };
    if (!warehouses && !isValidating) return { loading: true };

    return { warehouses: warehouses?.data || [], loading: isValidating, error: error?.response?.data?.errors };
};

const Dashboard = () => {
    const { user } = useAuth({ middleware: "auth" });
    const userRole = user.role?.role;

    const [notification, setNotification] = useState("");
    const warehouse = user?.role?.warehouse_id;

    const [loading, setLoading] = useState(false);
    const { warehouses, warehousesError } = useGetWarehouses();
    // const [warehouses, setWarehouses] = useState([]);
    // const fetchWarehouses = async (url = "/api/get-all-warehouses") => {
    //     setLoading(true);
    //     try {
    //         const response = await axios.get(url);
    //         setWarehouses(response.data.data);
    //     } catch (error) {
    //         setErrors(error.response?.data?.errors || ["Something went wrong."]);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    useEffect(() => {
        mutate("/api/get-all-warehouses");
    }, []);

    // console.log(warehouses);
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
                        <VoucherSalesTable warehouse={warehouse} warehouses={warehouses} userRole={userRole} />
                        <ExpenseTable warehouse={warehouse} warehouses={warehouses} userRole={userRole} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
