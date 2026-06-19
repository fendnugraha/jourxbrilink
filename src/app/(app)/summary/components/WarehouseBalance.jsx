"use client";

import { useCallback, useEffect, useState } from "react";
import formatNumber from "@/libs/formatNumber";
import { DownloadIcon, FilterIcon, LoaderCircle, Lock, RefreshCcwIcon, Star, Unlock } from "lucide-react";
import Input from "@/components/Input";
import Link from "next/link";
import { getStorePerformanceRating } from "@/libs/GetStorePerformanceRating";
import { useGetWarehouseBalance } from "@/libs/getWarehouseBalance";
import { TimeAgo } from "@/libs/format";
import axios from "@/libs/axios";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const WarehouseBalance = () => {
    // const [warehouseBalance, setWarehouseBalance] = useState([]);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(getCurrentDate());
    const { warehouseBalance, warehouseBalanceError, isValidating, mutate } = useGetWarehouseBalance(endDate);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const [errors, setErrors] = useState([]);

    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState("");
    const fetchZones = useCallback(async () => {
        try {
            const response = await axios.get("/api/zones");
            setZones(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const calculateLimitPercentage = (limit, value) => {
        const result = ((value / (limit * 2.1)) * 100).toFixed(2);
        if (result > 100) return 100;

        return ((value / (limit * 2.1)) * 100).toFixed(2);
    };

    const getLimitColor = (percent) => {
        if (percent >= 80) return "bg-green-500";
        if (percent >= 40) return "bg-yellow-400";
        return "bg-red-500";
    };

    const changeLockStatus = async (id) => {
        try {
            const response = await axios.put(`api/toggle-lock-status-by-id/${id}`);
            setNotification({
                type: "success",
                message: response.data.message,
            });
            mutate();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Update failed",
            });
        }
    };
    return (
        <div className="card relative">
            <div className="p-4 flex justify-between gap-2">
                <h4 className="card-title">
                    Saldo Kas & bank
                    <span className="card-subtitle">Periode: {endDate}</span>
                </h4>
                <div className="flex gap-1 h-fit">
                    <select className="form-select !w-96" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                        <option value="">Semua Zona</option>
                        {zones?.map((zone) => (
                            <option key={zone?.id} value={zone?.id}>
                                {zone?.zone_name}
                            </option>
                        ))}
                    </select>
                    <button onClick={() => mutate()} className="small-button">
                        <RefreshCcwIcon className="size-4" />
                    </button>
                    <button className="small-button" disabled={true}>
                        <DownloadIcon className="size-4" />
                    </button>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control !w-fit" />
                    {/* <button onClick={() => setIsModalFilterDataOpen(true)} className="small-button">
                        <FilterIcon className="size-4" />
                    </button> */}
                </div>
            </div>
            <div className="overflow-x-auto relative">
                {isValidating && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/20 w-full h-full flex gap-2 items-center justify-center rounded-3xl backdrop-blur-sm">
                        <LoaderCircle size={30} className="animate-spin" /> Loading...
                    </div>
                )}
                <table className="table w-full text-xs">
                    <thead className="">
                        <tr className="">
                            <th className="text-center">Cabang (Konter)</th>
                            <th className="text-center">Kas (Tunai)</th>
                            <th className="text-center">Saldo Bank</th>
                            <th className="text-center">Jumlah</th>
                            <th className="text-center">Last Update</th>
                            <th className="text-center"></th>
                            <th className="text-center w-12">Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {warehouseBalance.warehouse
                            ?.filter((w) => selectedZone === "" || w.zone_id === Number(selectedZone))
                            .map((w, i) => (
                                <tr key={i}>
                                    <td className="">
                                        <Link className="hover:underline" href={`/summary/warehouse/${w.id}`}>
                                            {i + 1}. {w.name.replace(/^konter\s*/i, "")}
                                        </Link>
                                    </td>
                                    <td className="w-25">
                                        {(() => {
                                            const percent = w.id !== 1 && calculateLimitPercentage(w.total_cash_limit, w.cash);
                                            const color = getLimitColor(percent);

                                            return (
                                                <div>
                                                    {w.id !== 1 && (
                                                        <div className="bg-slate-200 dark:bg-slate-700 rounded h-0.5 w-full overflow-hidden">
                                                            <div className={`${color} h-0.5 transition-all duration-500`} style={{ width: `${percent}%` }} />
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between text-xs mt-1">
                                                        <span>{formatNumber(w.cash)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="text-end">{formatNumber(w.bank)}</td>
                                    <td
                                        className={`text-end font-bold ${w.cash + w.bank - w.total_limit !== 0 && w.id !== 1 && "text-red-500 dark:text-red-400"}`}
                                    >
                                        {formatNumber(w.cash + w.bank)}
                                    </td>
                                    <td className="text-center text-slate-500">{<TimeAgo timestamp={w.updated_at} />}</td>
                                    <td className="text-center text-slate-500">
                                        <button onClick={() => changeLockStatus(w.id)}>
                                            {w.status === 1 ? <Unlock size={14} className="text-green-500" /> : <Lock size={14} className="text-red-300" />}
                                        </button>
                                    </td>
                                    <td className="text-center w-12">
                                        {w.id > 1 && (
                                            <span className="bg-green-300 text-green-800 p-1 rounded">{getStorePerformanceRating(w.average_profit)}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
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
                                <th></th>
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
