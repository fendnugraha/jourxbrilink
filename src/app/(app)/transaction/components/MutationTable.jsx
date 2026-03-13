"use client";

import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { Bike, CheckCheck } from "lucide-react";
import { formatDurationTime } from "@/libs/format";
const MutationTable = ({ journalsByWarehouse, user }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [deliveryStatus, setDeliveryStatus] = useState("");

    const filteredJournals = journalsByWarehouse.data?.filter((journal) => {
        const matchWarehouse = journal.debt_code === user?.role?.warehouse?.chart_of_account_id && journal.trx_type === "Mutasi Kas";
        const matchDeliveryStatus = deliveryStatus ? journal.status === Number(deliveryStatus) : true;

        const matchSearchTerm = searchTerm
            ? (journal.invoice ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
              (journal.amount ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        return matchDeliveryStatus && matchWarehouse && matchSearchTerm;
    });

    const totalItems = filteredJournals?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredJournals?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    return (
        <>
            <div className="flex gap-2 px-4">
                <input
                    type="search"
                    placeholder="Search..."
                    className="form-control flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select className="form-select !w-fit block p-2.5" onChange={(e) => setDeliveryStatus(e.target.value)}>
                    <option value="">Semua</option>
                    <option value={0}>Dalam Pengiriman</option>
                    <option value={1}>Diterima</option>
                </select>
                <select
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="form-select !w-fit block p-2.5"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
            <div className="px-4">
                <h1 className="text-lg font-bold mb-2">
                    <span className="font-normal text-sm">Total Mutasi:</span> Rp.{" "}
                    {formatNumber(filteredJournals?.reduce((total, journal) => total + journal.amount, 0))}
                </h1>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl">
                    {currentItems.map((journal) => (
                        <div
                            className="flex justify-between px-4 py-2 text-xs items-end sm:items-center border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                            key={journal.id}
                        >
                            <div className="flex flex-col gap-1">
                                <span className="block font-bold text-yellow-500 dark:text-yellow-300">{journal.invoice}</span>
                                <div>
                                    <span className="text-xs flex gap-1">
                                        <Bike size={14} className="bg-yellow-500 p-0.5 rounded-full" /> {formatDateTime(journal.date_issued)}
                                    </span>
                                    <span className="text-xs flex gap-1">
                                        <CheckCheck size={14} className="bg-green-500 p-0.5 rounded-full" />{" "}
                                        {journal.status === 0 ? "-" : formatDateTime(journal.updated_at)}{" "}
                                        {journal.status === 1 && (
                                            <span className="italic">({formatDurationTime(journal.updated_at, journal.date_issued)})</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-end flex-col sm:flex-row sm:gap-4">
                                <div className="text-base sm:text-xl font-bold">{formatNumber(journal.amount)}</div>
                                <div className="">
                                    <StatusBadge
                                        status={journal.status === 0 ? "In Progress" : "Completed"}
                                        statusText={journal.status === 0 ? "On Delivery" : "Delivered"}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default MutationTable;
