"use client";
import axios from "@/libs/axios";
import { formatNumber } from "@/libs/format";
import { use, useCallback, useEffect, useState } from "react";

const PayrollInvoices = ({ params }) => {
    const { date } = use(params);

    const [payrolls, setPayrolls] = useState([]);
    const fetchPayrolls = useCallback(async () => {
        try {
            const response = await axios.get(`/api/get-payroll-by-date/${date}`);
            setPayrolls(response.data.data);
        } catch (error) {
            console.error(error);
        }
    }, [date]);

    useEffect(() => {
        fetchPayrolls();
    }, [fetchPayrolls]);

    console.log(payrolls);
    return (
        <>
            <button onClick={() => window.print()} className="bg-slate-700 dark:bg-amber-400 text-white px-4 py-2 rounded no-print mb-18 sm:mb-0">
                Cetak Nota
            </button>
            <div id="print-area" className="grid grid-cols-3 gap-4 p-4 overflow-auto w-[1000px]">
                {payrolls.map((payroll) => (
                    <div key={payroll?.id}>
                        <div className="p-4 border border-blue-300 text-blue-500 rounded-2xl">
                            <h1 className="mb-4 font-bold">{payroll?.employee?.contact?.name}</h1>
                            <h1 className="font-bold text-sm">Pendapatan:</h1>
                            <table className="table-auto w-full text-xs">
                                <tbody>
                                    <tr>
                                        <td className="font-semibold p-1">Gaji Pokok</td>
                                        <td className="text-right">Rp {formatNumber(payroll?.total_gross_pay)}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold p-1">Tunjangan/Komisi</td>
                                        <td className="text-right">Rp {formatNumber(payroll?.total_commissions)}</td>
                                    </tr>
                                    {payroll?.items.filter((item) => item?.type === "allowance").length > 0 && (
                                        <tr>
                                            <td className="font-semibold p-1">Bonus</td>
                                            <td className="text-right"></td>
                                        </tr>
                                    )}
                                    {payroll?.items
                                        ?.filter((item) => item?.type === "allowance")
                                        .map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-1">{item?.item_name}</td>
                                                <td className="text-right">Rp {formatNumber(item?.amount)}</td>
                                            </tr>
                                        ))}
                                    <tr className="border-t border-slate-300">
                                        <td className="font-semibold p-1">Total Pendapatan</td>
                                        <td className="font-semibold text-right">
                                            Rp{" "}
                                            {formatNumber(
                                                Number(payroll?.total_gross_pay) + Number(payroll?.total_commissions) + Number(payroll?.total_allowances)
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <h1 className="font-bold text-sm mt-2">Potongan:</h1>
                            <table className="table-auto w-full text-xs">
                                <tbody>
                                    <tr>
                                        <td className="font-semibold p-1">Potongan lainnya</td>
                                        <td className="text-right"></td>
                                    </tr>
                                    {payroll?.items
                                        ?.filter((item) => item?.type === "deduction")
                                        .map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-1">{item?.item_name}</td>
                                                <td className="text-right">Rp {formatNumber(item?.amount)}</td>
                                            </tr>
                                        ))}
                                    <tr className="border-t border-slate-300">
                                        <td className="font-semibold p-1">Total Potongan</td>
                                        <td className="font-semibold text-right">Rp {formatNumber(payroll?.total_deductions)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="mt-4 flex justify-between">
                                <h1 className="font-bold text-sm mt-2">Total Gaji Diterima:</h1>
                                <h1 className="font-bold text-sm">Rp {formatNumber(payroll?.net_pay)}</h1>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default PayrollInvoices;
