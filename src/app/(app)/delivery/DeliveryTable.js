"use client";
import SimplePagination from "@/components/SimplePagination";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime, formatDurationTime, formatNumber } from "@/libs/format";
import getDistance from "@/libs/getDistance";
import { Bike, CheckCheck, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const DeliveryTable = ({ headquarter, filteredJournals, itemsPerPage, currentPage, setCurrentPage }) => {
    const totalItems = filteredJournals?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredJournals?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    return (
        <>
            <div className="overflow-x-auto">
                <table className="table-auto table w-full text-xs">
                    <thead>
                        <tr>
                            <th className="">Waktu</th>
                            <th className="">Amount</th>
                            <th className="">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems?.map((journal) => (
                            <tr key={journal?.id}>
                                <td className="">
                                    <Link
                                        href={`/delivery/invoice/${journal?.invoice}`}
                                        target="blank"
                                        className="block hover:underline font-bold text-yellow-500 dark:text-yellow-300 mb-1"
                                    >
                                        {journal?.invoice}
                                    </Link>
                                    <span className="text-xs flex gap-1">
                                        <MapPin size={14} className="text-red-500 dark:text-red-300" /> {journal?.debt?.warehouse?.name}{" "}
                                        {journal?.debt?.warehouse?.latitude && journal?.debt?.warehouse?.longitude && (
                                            <span className="italic">
                                                {getDistance(
                                                    headquarter.latitude,
                                                    headquarter.longitude,
                                                    journal?.debt?.warehouse?.latitude,
                                                    journal?.debt?.warehouse?.longitude
                                                ).toFixed(2)}{" "}
                                                km
                                            </span>
                                        )}
                                        <Bike size={14} className="ml-1 bg-yellow-500 p-0.5 rounded-full" /> {formatDateTime(journal?.date_issued)}
                                        <CheckCheck size={14} className="ml-1 bg-green-500 p-0.5 rounded-full" />{" "}
                                        {journal?.status === 0 ? "-" : formatDateTime(journal?.updated_at)}
                                        {journal?.status === 1 && (
                                            <span className="italic">({formatDurationTime(journal?.updated_at, journal?.date_issued)})</span>
                                        )}
                                    </span>
                                </td>
                                <td className="text-right text-lg font-bold">{formatNumber(journal?.amount)}</td>
                                <td className="text-center">
                                    <StatusBadge
                                        status={journal?.status === 0 ? "In Progress" : "Completed"}
                                        statusText={journal?.status === 0 ? "On Delivery" : "Delivered"}
                                    />
                                    {/* <span className="block text-xs">({formatDateTime(journal?.updated_at)})</span> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <SimplePagination
                    className="w-full px-4"
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            )}
        </>
    );
};

export default DeliveryTable;
