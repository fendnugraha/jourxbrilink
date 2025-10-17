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
import CorrectionTable from "../inspection/CorrectionTable";
import MutationTable from "./MutationTable";

const getCurrentDate = () => {
    const nowUTC = new Date();
    const jakartaOffset = 7 * 60; // WIB = UTC+7 (dalam menit)
    const local = new Date(nowUTC.getTime() + jakartaOffset * 60 * 1000);

    const year = local.getUTCFullYear();
    const month = String(local.getUTCMonth() + 1).padStart(2, "0");
    const day = String(local.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const TransactionContent = () => {
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

    const [endDate, setEndDate] = useState(getCurrentDate());
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouse);
    const { accountBalance, error: accountBalanceError, loading: isValidating } = useCashBankBalance(selectedWarehouseId, endDate);
    const fetchJournalsByWarehouse = useCallback(async (selectedWarehouse = warehouse, startDate = getCurrentDate(), endDate = getCurrentDate()) => {
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

    const [selectTable, setSelectTable] = useState("transaksi");

    const [correction, setCorrection] = useState([]);
    const fetchCorrection = useCallback(
        async (url = "/api/correction") => {
            setLoading(true);
            try {
                const response = await axios.get(url, { params: { warehouse_id: selectedWarehouseId, start_date: endDate, end_date: endDate } });
                setCorrection(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [selectedWarehouseId, endDate]
    );

    useEffect(() => {
        fetchCorrection();
    }, [fetchCorrection]);
    return (
        <>
            <div className="py-4 sm:py-8 px-4 sm:px-12 mb-28 sm:mb-0">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {notification.message && (
                        <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                    )}
                    <div className="card py-4 col-span-1 sm:col-span-3 order-2 sm:order-1 drop-shadow-sm h-fit">
                        <TransactionMenu
                            user={user}
                            fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            accountBalance={accountBalance}
                            setNotification={setNotification}
                            cashBank={cashBank}
                        />
                        <div className="flex mb-4 px-4">
                            <button
                                onClick={() => setSelectTable("transaksi")}
                                className={`${
                                    selectTable === "transaksi"
                                        ? "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg border-b-0 rounded-b-none"
                                        : "bg-slate-100 dark:bg-slate-700"
                                } px-3 py-1 cursor-pointer mr-2 text-sm`}
                            >
                                Transaksi
                            </button>
                            <button
                                onClick={() => setSelectTable("mutasi")}
                                className={`${
                                    selectTable === "mutasi"
                                        ? "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg border-b-0 rounded-b-none"
                                        : "bg-slate-100 dark:bg-slate-700"
                                } px-3 py-1 cursor-pointer mr-2 text-sm`}
                            >
                                Mutasi Kas{" "}
                                {journalsByWarehouse.data?.filter(
                                    (journal) => Number(journal.debt_code) === warehouseCashId && journal.trx_type === "Mutasi Kas"
                                ).length > 0 && (
                                    <span className="bg-green-500 dark:bg-green-600 text-xs rounded-full px-2 py-0.5 ml-2">
                                        {
                                            journalsByWarehouse.data?.filter(
                                                (journal) => Number(journal.debt_code) === warehouseCashId && journal.trx_type === "Mutasi Kas"
                                            ).length
                                        }
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setSelectTable("koreksi")}
                                className={`${
                                    selectTable === "koreksi"
                                        ? "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg border-b-0 rounded-b-none"
                                        : "bg-slate-100 dark:bg-slate-700"
                                } px-3 py-1 cursor-pointer text-sm`}
                            >
                                Koreksi{" "}
                                {correction.length > 0 && (
                                    <span className="bg-red-500 dark:bg-red-500 text-xs rounded-full px-2 py-0.5 ml-2">{correction.length}</span>
                                )}
                            </button>
                        </div>
                        {selectTable === "transaksi" && (
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
                        )}
                        {selectTable === "mutasi" && <MutationTable journalsByWarehouse={journalsByWarehouse} user={user} />}
                        {selectTable === "koreksi" && (
                            <CorrectionTable
                                correctionData={correction}
                                selectedWarehouseCashId={warehouseCashId}
                                fetchCorrection={fetchCorrection}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                            />
                        )}
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
