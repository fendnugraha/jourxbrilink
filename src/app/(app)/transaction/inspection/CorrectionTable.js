import SimplePagination from "@/components/SimplePagination";
import { useAuth } from "@/libs/auth";
import axios from "@/libs/axios";
import { formatDateTime, formatNumber } from "@/libs/format";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const CorrectionTable = ({ correctionData, selectedWarehouseCashId, fetchCorrection, notification }) => {
    const { user } = useAuth({ middleware: "auth" });
    const userRole = user?.role?.role;
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = correctionData?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = correctionData?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDeleteCorrection = async (id) => {
        confirm("Are you sure you want to delete this correction?");
        try {
            const response = await axios.delete(`/api/correction/${id}`);
            notification({ type: "success", message: response.data.message });
            fetchCorrection();
        } catch (error) {
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            console.error("Error deleting correction:", error);
        }
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th className="text-center">Description</th>
                            <th className="text-center">Jumlah</th>
                            <th className="text-center" hidden={!["Super Admin"].includes(userRole)}>
                                Action
                            </th>
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
                                                Journal (ID: {item.journal_id}): {item.reference_journal?.trx_type}{" "}
                                                {item.reference_journal?.debt_code === selectedWarehouseCashId
                                                    ? item.reference_journal?.cred?.acc_name
                                                    : item.reference_journal?.debt?.acc_name}
                                                , Jumlah: {formatNumber(item.reference_journal?.amount)}, Fee:{" "}
                                                {formatNumber(item.reference_journal?.fee_amount)}
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
                                    <td className="" hidden={!["Super Admin"].includes(userRole)}>
                                        <div className="flex justify-center gap-3">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500">
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500"
                                                onClick={() => handleDeleteCorrection(item.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center">
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
