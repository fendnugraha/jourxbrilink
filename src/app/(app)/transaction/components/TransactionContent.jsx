"use client";
import { useAuth } from "@/libs/auth";
import TransactionMenu from "./TransactionMenu";
import { useCallback, useEffect, useState } from "react";
import { mutate } from "swr";
import useCashBankBalance from "@/libs/cashBankBalance";
import CashBankBalance from "./CashBankBalance";
import axios from "@/libs/axios";
import JournalTable from "./JournalTable";
import useGetWarehouses from "@/libs/getAllWarehouse";
import Notification from "@/components/Notification";
import TransactionMenuMobile from "./TransactionMenuMobile";
import VoucherSalesTable from "../../dashboard/components/VoucherSalesTable";

const TransactionContent = ({ currentDate }) => {
    const { user } = useAuth({ middleware: "auth" });
    const warehouse = Number(user?.role?.warehouse_id);
    const warehouseCashId = Number(user?.role?.warehouse?.chart_of_account_id);
    const warehouseName = user?.role?.warehouse?.name;
    const { warehouses, warehousesError } = useGetWarehouses();
    const [cashBank, setCashBank] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCashBank = async () => {
        try {
            const response = await axios.get(`/api/get-cash-and-bank`);
            setCashBank(response.data.data); // Commented out as it's not used
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCashBank();
    }, []);
    const hqCashBank = cashBank.filter((cashBank) => Number(cashBank.warehouse_id) === 1);

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);

    const [endDate, setEndDate] = useState(currentDate);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouse);
    const { accountBalance, error: accountBalanceError, loading: isValidating } = useCashBankBalance(selectedWarehouseId, endDate);
    const fetchJournalsByWarehouse = useCallback(async (selectedWarehouse = warehouse, startDate = currentDate, endDate = currentDate) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-journal-by-warehouse/${selectedWarehouse}/${startDate}/${endDate}`);
            setJournalsByWarehouse(response.data);
        } catch (error) {
            setNotification({ type: "error", message: "Something went wrong." });
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJournalsByWarehouse();
    }, [fetchJournalsByWarehouse]); // Include startDate and endDate in the dependency array

    useEffect(() => {
        mutate(`/api/get-cash-bank-balance/${selectedWarehouseId}/${endDate}`);
    }, [journalsByWarehouse]);
    return (
        <>
            <div className="py-4 sm:py-8 px-4 sm:px-12 mb-28 sm:mb-0">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {notification.message && (
                        <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                    )}
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-3xl col-span-1 sm:col-span-3 order-2 sm:order-1 drop-shadow-sm h-fit">
                        <TransactionMenu
                            user={user}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            accountBalance={accountBalance}
                            setNotification={setNotification}
                            cashBank={cashBank}
                        />
                        <JournalTable
                            cashBank={cashBank}
                            notification={setNotification}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            journalsByWarehouse={journalsByWarehouse}
                            warehouses={warehouses}
                            warehouse={warehouse}
                            warehouseId={(warehouseId) => setSelectedWarehouseId(warehouseId)}
                            user={user}
                            loading={loading}
                            hqCashBank={hqCashBank}
                        />
                    </div>
                    <div className="order-1 sm:order-2">
                        <CashBankBalance warehouse={warehouse} accountBalance={accountBalance} isValidating={isValidating} user={user} />
                        <div className="mt-4 hidden sm:block">
                            <VoucherSalesTable
                                warehouse={warehouse}
                                warehouseName={warehouseName}
                                warehouses={warehouses}
                                userRole={"Kasir"}
                                showOnlyQty={true}
                                showOnlyVoucher={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <TransactionMenuMobile
                user={user}
                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                accountBalance={accountBalance}
                setNotification={setNotification}
                cashBank={cashBank}
                warehouseCashId={warehouseCashId}
                warehouse={warehouse}
            />
        </>
    );
};

export default TransactionContent;
