"use client";
import MainPage from "@/app/(app)/main";
import axios from "@/libs/axios";
import { formatDateTime, formatNumber } from "@/libs/format";
import { use, useCallback, useEffect, useState } from "react";
import InvoiceCard from "./InvoiceCard";

const InvoicePage = ({ params }) => {
    const { invoice_number } = use(params);

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ type: "", message: "" });

    const [journal, setJournal] = useState(null);

    const fetchJournal = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-journal-by-invoice-number/${invoice_number}`);
            setJournal(response.data.data); // Commented out as it's not used
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, [invoice_number]);

    useEffect(() => {
        fetchJournal();
    }, [fetchJournal]);

    return (
        <MainPage headerTitle="Delivery Invoice">
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                <div id="print-area" className="p-4 bg-white w-[300px] text-slate-600">
                    <InvoiceCard journal={journal} />
                    <InvoiceCard journal={journal} footNote="Penerima" />
                </div>
                <button onClick={() => window.print()} className="mt-4 bg-slate-700 dark:bg-amber-400 text-white px-4 py-2 rounded no-print mb-18 sm:mb-0">
                    Cetak Nota
                </button>
            </div>
        </MainPage>
    );
};

export default InvoicePage;
