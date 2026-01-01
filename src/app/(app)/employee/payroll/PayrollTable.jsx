import StatusBadge from "@/components/StatusBadge";
import axios from "@/libs/axios";
import { formatNumber } from "@/libs/format";
import { Printer, Table } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const PayrollTable = () => {
    const [payrolls, setPayrolls] = useState([]);

    const fetchPayrolls = useCallback(async () => {
        try {
            const response = await axios.get("/api/get-payroll");
            setPayrolls(response.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchPayrolls();
    }, [fetchPayrolls]);

    return (
        <div className="overflow-x-auto">
            <table className="w-full table text-xs">
                <thead>
                    <tr>
                        <th>Periode</th>
                        <th>Gaji/Tunjangan</th>
                        <th>Bonus/Lainnya</th>
                        <th>Biaya Gaji</th>
                        <th>Potongan</th>
                        <th>Total Diterima</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {payrolls.data?.payrollTotal?.map((payroll, index) => (
                        <tr key={index}>
                            <td className="text-center">{payroll?.payroll_date}</td>
                            <td className="text-center text-green-500">
                                {formatNumber(Number(payroll?.total_gross_pay) + Number(payroll?.total_commissions))}
                            </td>
                            <td className="text-center text-green-500">{formatNumber(payroll?.total_allowances)}</td>

                            <td className="text-center font-bold text-green-500">
                                {formatNumber(Number(payroll?.total_gross_pay) + Number(payroll?.total_commissions) + Number(payroll?.total_allowances))}
                            </td>
                            <td className="text-center text-red-500 dark:text-red-300">{formatNumber(payroll?.total_deductions)}</td>
                            <td className="text-center text-indigo-500 dark:text-indigo-300">{formatNumber(payroll?.net_pay)}</td>
                            <td className="text-center">
                                <StatusBadge status={"Completed"} />
                            </td>
                            <td>
                                <Link href={`/employee/payroll/invoice/${payroll?.payroll_date}`}>
                                    <Printer size={20} />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PayrollTable;
