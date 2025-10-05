import SimplePagination from "@/components/SimplePagination";
import { formatDateTime, formatNumber } from "@/libs/format";
import Link from "next/link";
import { useState } from "react";

const CorrectionTable = ({ correctionData, selectedWarehouseCashId }) => {
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = correctionData?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = correctionData?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th className="text-center">Description</th>
                            <th className="text-center">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={index}>
                                    <td className="">
                                        <span className="text-xs block text-blue-500 dark:text-yellow-400 font-bold">
                                            Tanggal: {formatDateTime(item.date_issued)}, Tanggal Koreksi: {formatDateTime(item.created_at)}
                                        </span>
                                        Note: {item.description}
                                        {item.journal_id && (
                                            <span className="text-xs block">
                                                Journal: {item.journal?.trx_type}{" "}
                                                {item.journal?.debt_code === selectedWarehouseCashId
                                                    ? item.journal?.cred?.acc_name
                                                    : item.journal?.debt?.acc_name}
                                                , Jumlah: {formatNumber(item.journal?.amount)}, Fee: {formatNumber(item.journal?.fee_amount)}
                                            </span>
                                        )}
                                        {item.image_url && (
                                            <Link
                                                href={item.image_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 dark:text-blue-400 hover:underline"
                                            >
                                                <span className="text-xs block">Lihat Bukti</span>
                                            </Link>
                                        )}
                                    </td>
                                    <td className="text-center text-xl font-bold">{formatNumber(item.amount)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="text-center">
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
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

export default CorrectionTable;
