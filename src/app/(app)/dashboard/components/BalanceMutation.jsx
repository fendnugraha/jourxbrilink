"use client";
import { DateTimeNow } from "@/libs/format";
import CreateMutationFromHq from "./CreateMutationFromHq";
import { useCallback, useEffect, useState } from "react";
import useGetWarehouses from "@/libs/getAllWarehouse";
import useGetMutationJournal from "@/libs/getMutationJournal";
import useCashBankBalance from "@/libs/cashBankBalance";
import axios from "@/libs/axios";
import { mutate } from "swr";

const BalanceMutation = () => {
    const { today } = DateTimeNow();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [isModalCreateMutationFromHqOpen, setIsModalCreateMutationFromHqOpen] = useState(false);
    const closeModal = () => {
        setIsModalCreateMutationFromHqOpen(false);
    };
    const { warehouses, warehousesError } = useGetWarehouses();
    const [cashBank, setCashBank] = useState([]);
    const fetchCashBank = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-cash-and-bank`);
            setCashBank(response.data.data); // Commented out as it's not used
        } catch (error) {
            // notification(error.response?.data?.message || "Something went wrong.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCashBank();
    }, [fetchCashBank]);

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const { journals, error, isValidating } = useGetMutationJournal(startDate, endDate);
    useEffect(() => {
        mutate(`/api/mutation-journal/${startDate}/${endDate}`);
    }, [startDate, endDate]);

    const { accountBalance, error: accountBalanceError, loading: accountBalanceLoading, mutateCashBankBalance } = useCashBankBalance(1, endDate);
    const cashBalance = accountBalance?.data?.chartOfAccounts?.find((acc) => acc?.account_id === 1)?.balance;

    const headquarter = warehouses?.data?.find((warehouse) => warehouse?.id === 1);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-4">
                <h1 className="card-title mb-4">Mutasi Saldo</h1>
                <CreateMutationFromHq
                    cashBank={cashBank}
                    isModalOpen={setIsModalCreateMutationFromHqOpen}
                    notification={setNotification}
                    fetchJournalsByWarehouse={() => mutate(`/api/mutation-journal/${startDate}/${endDate}`)}
                    warehouses={warehouses?.data}
                    accountBalance={accountBalance}
                />
            </div>
        </div>
    );
};

export default BalanceMutation;
