"use client";

import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";

const WarehouseBalance = () => {
    const [warehouseBalance, setWarehouseBalance] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchWarehouseBalance = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/get-warehouse-balance");
            setWarehouseBalance(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouseBalance();
    }, []);

    return (
        <div className="bg-white rounded-lg mb-3 relative">
            <div className="p-4">
                <h4 className=" text-blue-950 text-lg font-bold">Saldo Kas dan Bank Cabang</h4>
            </div>
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
                                <td className="">{w.name}</td>
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
    );
};

export default WarehouseBalance;
