"use client";

import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import { ArrowRightIcon } from "lucide-react";

const MutationHistory = () => {
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        account: 52,
    });
    const [mutation, setMutation] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchMutation = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/api/mutation-history", {
                    params: formData,
                });
                setMutation(response.data.data);
            } catch (error) {
                setNotification(error.response?.data?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };
        fetchMutation();
    }, [formData]);

    return (
        <div className="bg-white rounded-lg mb-3 relative">
            <div className="p-4">
                <h4 className="mb-4 text-blue-950 text-lg font-bold">Riwayat Mutasi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
                    <div className="bg-sky-700 p-2 sm:px-4 sm:py-2 rounded-xl text-white">
                        <h5 className="sm:text-xs">Saldo Awal</h5>
                        <span className="sm:text-xl font-bold">{formatNumber(mutation?.initBalance)}</span>
                    </div>
                    <div className="bg-sky-700 p-2 sm:px-4 sm:py-2 rounded-xl text-white">
                        <h5 className="sm:text-xs">Debet</h5>
                        <span className="sm:text-xl font-bold">{formatNumber(mutation?.debt_total)}</span>
                    </div>
                    <div className="bg-sky-700 p-2 sm:px-4 sm:py-2 rounded-xl text-white">
                        <h5 className="sm:text-xs">Credit</h5>
                        <span className="sm:text-xl font-bold">{formatNumber(mutation?.cred_total)}</span>
                    </div>
                    <div className="bg-sky-700 p-2 sm:px-4 sm:py-2 rounded-xl text-white">
                        <h5 className="sm:text-xs">Saldo Akhir</h5>
                        <span className="sm:text-xl font-bold">{formatNumber(mutation?.endBalance)}</span>
                    </div>
                </div>
            </div>

            <table className="table w-full text-xs">
                <thead>
                    <tr>
                        <th>Keterangan</th>
                        <th>Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={2}>Loading...</td>
                        </tr>
                    ) : (
                        mutation.journals?.data?.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <span className="text-xs text-slate-500 block">
                                        {item.invoice} | {formatDateTime(item.created_at)}
                                    </span>
                                    Note: {item.description}
                                    <span className="block font-bold text-xs">
                                        {item.cred.acc_name} <ArrowRightIcon className="size-4 inline" /> {item.debt.acc_name}
                                    </span>
                                </td>
                                <td className="font-bold">
                                    <span
                                        className={`${Number(item.debt_code) === Number(formData.account) ? "text-green-500" : ""}
                                    ${Number(item.cred_code) === Number(formData.account) ? "text-red-500" : ""}
                                        text-sm md:text-base sm:text-lg`}
                                    >
                                        {formatNumber(item.amount)}
                                    </span>
                                    {item.fee_amount !== 0 && <span className="text-xs text-blue-600 block">{formatNumber(item.fee_amount)}</span>}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MutationHistory;
