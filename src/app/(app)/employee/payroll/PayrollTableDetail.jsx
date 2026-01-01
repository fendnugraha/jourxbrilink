import StatusBadge from "@/components/StatusBadge";
import axios from "@/libs/axios";
import { DateTimeNow, formatNumber } from "@/libs/format";
import { Printer, Table } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
const PayrollTableDetail = () => {
    const { thisMonth, thisYear } = DateTimeNow();
    const [month, setMonth] = useState(thisMonth);
    const [year, setYear] = useState(thisYear);

    const date = `${year}-${month}-01`;

    const [payrolls, setPayrolls] = useState([]);

    const fetchPayrolls = useCallback(async () => {
        try {
            const response = await axios.get(`/api/get-payroll-by-date/${date}`);
            setPayrolls(response.data);
        } catch (error) {
            console.error(error);
        }
    }, [month, year, date]);

    useEffect(() => {
        fetchPayrolls();
    }, [fetchPayrolls]);
    console.log("date: " + date, payrolls);
    const totalSalary = payrolls.data?.reduce((total, item) => total + Number(item.total_gross_pay), 0);
    const totalCommissions = payrolls.data?.reduce((total, item) => total + Number(item.total_commissions), 0);
    const total_allowances = payrolls.data?.reduce((total, item) => total + Number(item.total_allowances), 0);
    const total_deductions = payrolls.data?.reduce((total, item) => total + Number(item.total_deductions), 0);

    const total_net_pay = payrolls.data?.reduce((total, item) => total + Number(item.net_pay), 0);
    return (
        <>
            <div className="flex gap-2 w-fit mb-2">
                <select className="form-control !w-72" onChange={(e) => setMonth(e.target.value)} value={month}>
                    <option>Bulan</option>
                    <option value={1}>Januari</option>
                    <option value={2}>Februari</option>
                    <option value={3}>Maret</option>
                    <option value={4}>April</option>
                    <option value={5}>Mei</option>
                    <option value={6}>Juni</option>
                    <option value={7}>Juli</option>
                    <option value={8}>Agustus</option>
                    <option value={9}>September</option>
                    <option value={10}>Oktober</option>
                    <option value={11}>November</option>
                    <option value={12}>Desember</option>
                </select>
                <select className="form-control !w-fit" onChange={(e) => setYear(e.target.value)} value={year}>
                    <option>Tahun</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                    <option value={2029}>2029</option>
                    <option value={2030}>2030</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full table text-xs">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Gaji/Tunjangan</th>
                            <th>Bonus/Lainnya</th>
                            <th>Biaya Gaji</th>
                            <th>Potongan</th>
                            <th>Total Diterima</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="font-bold bg-yellow-100 dark:bg-slate-600">
                            <td className="font-bold">Total</td>
                            <td className="text-right text-green-600 dark:text-green-300">{formatNumber(totalSalary + totalCommissions)}</td>
                            <td className="text-right text-green-600 dark:text-green-300">{formatNumber(total_allowances)}</td>
                            <td className="text-right text-green-600 dark:text-green-400">{formatNumber(totalSalary + totalCommissions + total_allowances)}</td>
                            <td className="text-right text-red-500 dark:text-red-300">{formatNumber(total_deductions)}</td>
                            <td className="text-right text-yellow-500 dark:text-yellow-200 font-bold">{formatNumber(total_net_pay)}</td>
                        </tr>
                        {payrolls.data?.map((p, index) => (
                            <tr key={index}>
                                <td>{p?.employee?.contact?.name}</td>
                                <td className="text-right text-green-600 dark:text-green-300">
                                    {formatNumber(Number(p?.total_gross_pay) + Number(p?.total_commissions))}
                                </td>
                                <td className="text-right text-green-600 dark:text-green-300">{formatNumber(Number(p?.total_allowances))}</td>
                                <td className="text-right text-green-600 dark:text-green-400 font-bold">
                                    {formatNumber(Number(p?.total_gross_pay) + Number(p?.total_commissions) + Number(p?.total_allowances))}
                                </td>
                                <td className="text-right text-red-500 dark:text-red-300">{formatNumber(Number(p?.total_deductions))}</td>
                                <td className="text-right text-yellow-500 dark:text-yellow-200 font-bold">{formatNumber(Number(p?.net_pay))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default PayrollTableDetail;
