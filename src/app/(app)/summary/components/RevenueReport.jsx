"use client";

import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";

const RevenueReport = () => {
    const [revenue, setRevenue] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchRevenueReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/get-revenue-report");
            setRevenue(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenueReport();
    }, []);

    const sumByTrxType = (trxType) => {
        return revenue.revenue?.reduce((total, item) => {
            return total + Number(item[trxType]);
        }, 0);
        // console.log(revenue.revenue?.[0][trxType]);
    };

    return (
        <div className="bg-white rounded-lg mb-3 relative">
            <div className="p-4">
                <h4 className=" text-blue-950 text-lg font-bold">Laporan Pendapatan</h4>
            </div>
            <table className="table w-full text-xs mb-2">
                <thead className="">
                    <tr>
                        <th className="">Cabang</th>
                        <th className="">Transfer</th>
                        <th className="">Tarik Tunai</th>
                        <th className="">Voucher</th>
                        <th className="">Deposit</th>
                        <th className="">Trx</th>
                        <th className="">Biaya</th>
                        <th className="">Laba Bersih</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={9}>Loading...</td>
                        </tr>
                    ) : (
                        revenue.revenue?.map((item, index) => (
                            <tr key={index}>
                                <td className="">{item.warehouse}</td>
                                <td className="text-end">{formatNumber(item.transfer)}</td>
                                <td className="text-end">{formatNumber(item.tarikTunai)}</td>
                                <td className="text-end">{formatNumber(item.voucher)}</td>
                                <td className="text-end">{formatNumber(item.deposit)}</td>
                                <td className="text-end">{formatNumber(item.trx)}</td>
                                <td className="text-end font-bold text-red-500">{formatNumber(item.expense)}</td>
                                <td className="text-end font-bold text-green-500">{formatNumber(item.fee)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
                <tfoot>
                    {loading ? (
                        <tr>
                            <td colSpan={9}>Loading...</td>
                        </tr>
                    ) : (
                        <tr>
                            <th className="font-bold">Total</th>
                            <th className="font-bold">{formatNumber(sumByTrxType("transfer"))}</th>
                            <th className="font-bold">{formatNumber(sumByTrxType("tarikTunai"))}</th>
                            <th className="font-bold">{formatNumber(sumByTrxType("voucher"))}</th>
                            <th className="font-bold">{formatNumber(sumByTrxType("deposit"))}</th>
                            <th className="font-bold">{formatNumber(sumByTrxType("trx"))}</th>
                            <th className="font-bold text-red-500">{formatNumber(sumByTrxType("expense"))}</th>
                            <th className="font-bold text-green-500">{formatNumber(sumByTrxType("fee"))}</th>
                        </tr>
                    )}
                </tfoot>
            </table>
        </div>
    );
};

export default RevenueReport;
