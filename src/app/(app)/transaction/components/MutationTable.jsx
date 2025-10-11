"use client";

import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
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
            <div>
                <h1 className="text-lg font-bold mb-2 px-4">
                    <span className="font-normal text-sm">Total Mutasi:</span> Rp.{" "}
                    {formatNumber(filteredJournals.reduce((total, journal) => total + journal.amount, 0))}
                </h1>
                <div className="overflow-x-auto">
                    <table className="table-auto table w-full text-xs">
                        <thead>
                            <tr>
                                <th className="">Date</th>
                                <th className="">Description</th>
                                <th className="">Amount</th>
                                <th className="">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((journal) => (
                                <tr key={journal.id}>
                                    <td className="">
                                        <span className="block font-bold text-yellow-500 dark:text-yellow-300">{journal.invoice}</span>
                                        {formatDateTime(journal.created_at)}
                                    </td>
                                    <td className="">{journal.description}</td>
                                    <td className="text-right text-lg font-bold">{formatNumber(journal.amount)}</td>
                                    <td className="text-center">
                                        <StatusBadge
                                            status={journal.status === 0 ? "In Progress" : "Completed"}
                                            statusText={journal.status === 0 ? "Dalam Pengiriman" : "Sudah Diterima"}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default MutationTable;
