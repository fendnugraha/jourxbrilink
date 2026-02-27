"use client";
import { useCallback, useEffect, useState } from "react";
import ReceivableLog from "./ReceivableLog";
import ReceivableTable from "./ReceivableTable";
import axios from "@/libs/axios";
import Notification from "@/components/Notification";
import { todayDate } from "@/libs/format";

const ReceivableContent = () => {
    const [startDate, setStartDate] = useState(todayDate());
    const [endDate, setEndDate] = useState(todayDate());
    const [perPage, setPerPage] = useState(10);

    const [finance, setFinance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContactId, setSelectedContactId] = useState("All");
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [type, setType] = useState("EmployeeReceivable");

    const fetchFinance = useCallback(
        async (url = `/api/finance-by-type/${selectedContactId}/${type}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        start: startDate,
                        end: endDate,
                        per_page: perPage,
                    },
                });
                setFinance(response.data.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        },
        [selectedContactId, type, startDate, endDate, perPage],
    );

    useEffect(() => {
        fetchFinance();
    }, [fetchFinance]);

    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <ReceivableTable
                    selectedContactId={selectedContactId}
                    setSelectedContactId={setSelectedContactId}
                    finance={finance.financeGroupByContactId}
                    fetchFinance={fetchFinance}
                    notification={setNotification}
                    type={type}
                    setType={setType}
                />
                <ReceivableLog
                    selectedContactId={selectedContactId}
                    financeLog={finance.finance}
                    fetchFinance={fetchFinance}
                    notification={setNotification}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    perPage={perPage}
                    setPerPage={setPerPage}
                />
            </div>
        </>
    );
};

export default ReceivableContent;
