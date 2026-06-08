"use client";
import Notification from "@/components/Notification";
import MutationForm from "./MutationForm";
import { useEffect, useState } from "react";

import useGetAllAccounts from "@/libs/getAllAccounts";
import useGetWarehouses from "@/libs/getAllWarehouse";
import { DateTimeNow } from "@/libs/format";
import axios from "@/libs/axios";
import MutationTable from "./MutationTable";
import { useAuth } from "@/libs/auth";
import useCashBankBalance from "@/libs/cashBankBalance";
import Balance from "./Balance";

const MutationContent = () => {
    const { user } = useAuth({ middleware: "auth" });
    const userRole = user?.role?.role;
    const warehouse = user?.role?.warehouse_id;
    const warehouseName = user?.role?.warehouse?.name;
    const { today } = DateTimeNow();
    const [endDate, setEndDate] = useState(today);
    const [loading, setLoading] = useState(false);
    const { accounts, accountsError } = useGetAllAccounts();
    const { warehouses, warehousesError } = useGetWarehouses();
    const [selectedWarehouse, setSelectedWarehouse] = useState(1);
    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const { accountBalance, accountBalanceError, isValidating, mutateCashBankBalance } = useCashBankBalance(selectedWarehouse, endDate);

    const fetchJournalsByWarehouse = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-journal-by-warehouse/${selectedWarehouse}/${endDate}/${endDate}`);
            setJournalsByWarehouse(response.data);
        } catch (error) {
            console.error(error);
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJournalsByWarehouse();
    }, [selectedWarehouse, endDate]);
    return (
        <div className="grid grid-cols-4 gap-4">
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <MutationForm
                setNotification={setNotification}
                accounts={accounts}
                warehouses={warehouses}
                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                accountBalance={accountBalance}
                mutateCashBankBalance={mutateCashBankBalance}
            />
            <MutationTable
                journals={journalsByWarehouse}
                warehouse={warehouse}
                warehouses={warehouses}
                userRole={userRole}
                cashBank={accounts}
                notification={setNotification}
                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
            />
            <Balance />
        </div>
    );
};

export default MutationContent;
