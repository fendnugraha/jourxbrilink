"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { DownloadIcon, FilterIcon, RefreshCcwIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Link from "next/link";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const WarehouseBalance = () => {
    const [warehouseBalance, setWarehouseBalance] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const fetchWarehouseBalance = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-warehouse-balance/${endDate}`);
            setWarehouseBalance(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, [endDate]);

    useEffect(() => {
        fetchWarehouseBalance();
    }, [fetchWarehouseBalance]);
    return (
        <div className="card relative">
            <div className="p-4 flex justify-between gap-2">
                <h4 className="card-title">
                    Saldo Kas & bank
                    <span className="card-subtitle">Periode: {endDate}</span>
                </h4>
                <div className="flex gap-1">
                    <button onClick={fetchWarehouseBalance} className="small-button">
                        <RefreshCcwIcon className="size-4" />
                    </button>
                    <button className="small-button" disabled={true}>
                        <DownloadIcon className="size-4" />
                    </button>
                    <button onClick={() => setIsModalFilterDataOpen(true)} className="small-button">
                        <FilterIcon className="size-4" />
                    </button>
                </div>
                <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                    <div className="mb-4">
                        <Label className="font-bold">Tanggal</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" />
                    </div>
                    <button onClick={fetchWarehouseBalance} className="btn-primary">
                        Submit
                    </button>
                </Modal>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead className="">
                        <tr className="">
                            <th className="text-center">Cabang (Konter)</th>
                            <th className="text-center">Kas Tunai</th>
                            <th className="text-center">Saldo Bank</th>
                            <th className="text-center">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4}>Loading...</td>
                            </tr>
                        ) : (
                            warehouseBalance.warehouse?.map((w, i) => (
                                <tr className="" key={i}>
                                    <td className="">
                                        <Link className="hover:underline" href={`/summary/warehouse/${w.id}`}>
                                            {i + 1}. {w.name}
                                        </Link>
                                    </td>
                                    <td className="text-end">{formatNumber(w.cash)}</td>
                                    <td className="text-end">{formatNumber(w.bank)}</td>
                                    <td className="text-end font-bold">{formatNumber(w.cash + w.bank)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        {loading ? (
                            <tr>
                                <td colSpan={4}>Loading...</td>
                            </tr>
                        ) : (
                            <tr>
                                <th>Total</th>
                                <th>{formatNumber(warehouseBalance.totalCash)}</th>
                                <th>{formatNumber(warehouseBalance.totalBank)}</th>
                                <th>{formatNumber(warehouseBalance.totalCash + warehouseBalance.totalBank)}</th>
                            </tr>
                        )}
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default WarehouseBalance;
