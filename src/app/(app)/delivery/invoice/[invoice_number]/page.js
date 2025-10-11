"use client";
import MainPage from "@/app/(app)/main";
import axios from "@/libs/axios";
import { formatDateTime, formatNumber } from "@/libs/format";
import { use, useCallback, useEffect, useState } from "react";

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
                    <div className="flex justify-between flex-col">
                        <div className="flex flex-col w-full">
                            <h1 className="text-xs font-bold text-center">{journal?.invoice}</h1>
                            <h1 className="text-xs font-bold text-center">{formatDateTime(journal?.date_issued)}</h1>
                        </div>
                        <div className="flex flex-col w-full mt-4">
                            <h1 className="text-xs text-center">Penambahan Saldo Kas</h1>
                            <h1 className="text-xl font-bold text-center">{formatNumber(journal?.amount)}</h1>
                        </div>
                        <div className="flex flex-col w-full mt-4">
                            <h1 className="text-xs text-center">Tujuan</h1>
                            <h1 className="text-xs font-bold text-center">{journal?.debt?.warehouse?.name}</h1>
                        </div>
                    </div>
                    <hr className="border-dashed border-slate-700 my-2" />
                    <div className="flex justify-between h-[50px]">
                        <h1 className="text-xs border-r border-dashed border-slate-700 w-full text-center first:border-s">Pengirim</h1>
                        <h1 className="text-xs border-r border-dashed border-slate-700 w-full text-center">Pengantar</h1>
                        <h1 className="text-xs border-r border-dashed border-slate-700 w-full text-center">Penerima</h1>
                    </div>
                    <hr className="border-dashed border-slate-700 my-2" />
                </div>
                <button onClick={() => window.print()} className="mt-4 bg-slate-700 dark:bg-amber-400 text-white px-4 py-2 rounded no-print mb-18 sm:mb-0">
                    Cetak Nota
                </button>
            </div>
        </MainPage>
    );
};

export default InvoicePage;
