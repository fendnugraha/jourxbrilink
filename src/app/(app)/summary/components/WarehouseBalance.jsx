"use client";

import { useState } from "react";
import formatNumber from "@/libs/formatNumber";
import { DownloadIcon, FilterIcon, RefreshCcwIcon, Star } from "lucide-react";
import Input from "@/components/Input";
import Link from "next/link";
import { getStorePerformanceRating } from "@/libs/GetStorePerformanceRating";
import { useGetWarehouseBalance } from "@/libs/getWarehouseBalance";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const WarehouseBalance = () => {
    // const [warehouseBalance, setWarehouseBalance] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(getCurrentDate());
    const { warehouseBalance, warehouseBalanceError, isValidating, mutate } = useGetWarehouseBalance(endDate);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    // const fetchWarehouseBalance = useCallback(async () => {
    //     setLoading(true);
    //     try {
    //         const response = await axios.get(`/api/get-warehouse-balance/${endDate}`);
    //         setWarehouseBalance(response.data.data);
    //     } catch (error) {
    //         setNotification(error.response?.data?.message || "Something went wrong.");
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [endDate]);

    // useEffect(() => {
    //     fetchWarehouseBalance();
    // }, [fetchWarehouseBalance]);

    return (
        <div className="card relative">
            <div className="p-4 flex justify-between gap-2">
                <h4 className="card-title">
                    Saldo Kas & bank
                    <span className="card-subtitle">Periode: {endDate}</span>
                </h4>
                <div className="flex gap-1 h-fit">
                    <button onClick={() => mutate()} className="small-button">
                        <RefreshCcwIcon className="size-4" />
                    </button>
                    <button className="small-button" disabled={true}>
                        <DownloadIcon className="size-4" />
                    </button>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control " />
                    {/* <button onClick={() => setIsModalFilterDataOpen(true)} className="small-button">
                        <FilterIcon className="size-4" />
                    </button> */}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead className="">
                        <tr className="">
                            <th className="text-center">Cabang (Konter)</th>
                            <th className="text-center">Kas Tunai</th>
                            <th className="text-center">Saldo Bank</th>
                            <th className="text-center">Jumlah</th>
                            <th className="text-center w-12">Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isValidating ? (
                            <tr>
                                <td colSpan={4}>Loading...</td>
                            </tr>
                        ) : (
                            warehouseBalance.warehouse?.map((w, i) => (
                                <tr key={i}>
                                    <td className="">
                                        <Link className="hover:underline" href={`/summary/warehouse/${w.id}`}>
                                            {i + 1}. {w.name.replace(/^konter\s*/i, "")}
                                        </Link>
                                    </td>
                                    <td className="text-end">{formatNumber(w.cash)}</td>
                                    <td className="text-end">{formatNumber(w.bank)}</td>
                                    <td className={`text-end font-bold ${w.cash + w.bank - w.total_limit !== 0 && w.id !== 1 && "text-red-300"}`}>
                                        {formatNumber(w.cash + w.bank)}
                                    </td>
                                    <td className="text-center w-12">
                                        {w.id > 1 && (
                                            <span className="bg-green-300 text-green-800 p-1 rounded">{getStorePerformanceRating(w.average_profit)}</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        {loading ? (
                            <tr>
                                <td colSpan={5}>Loading...</td>
                            </tr>
                        ) : (
                            <tr>
                                <th>Total</th>
                                <th className="text-right">{formatNumber(warehouseBalance.totalCash)}</th>
                                <th className="text-right">{formatNumber(warehouseBalance.totalBank)}</th>
                                <th className="text-right">{formatNumber(warehouseBalance.totalCash + warehouseBalance.totalBank)}</th>
                                <th></th>
                            </tr>
                        )}
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default WarehouseBalance;
