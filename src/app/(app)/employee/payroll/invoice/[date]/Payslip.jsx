import { formatLongDate, formatNumber, getMonthYear } from "@/libs/format";

const Payslip = ({ payroll, date }) => {
    return (
        <div className="w-[300px] bg-white text-slate-700 border border-slate-200">
            <div className="p-4 flex flex-col justify-between h-full">
                <div>
                    <h1 className=" font-bold mb-4 text-center">
                        THREE KOMUNIKA
                        <span className="text-xs font-normal block">{formatLongDate(date)}</span>
                    </h1>
                    <h1 className="font-semibold mb-2 text-white bg-indigo-600 px-2">{payroll?.employee?.contact?.name}</h1>
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
                                    <td className="font-semibold p-1">Lainnya</td>
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
                            <tr className="bg-indigo-200">
                                <td className="font-semibold p-1">Total Pendapatan</td>
                                <td className="font-semibold text-right">
                                    Rp {formatNumber(Number(payroll?.total_gross_pay) + Number(payroll?.total_commissions) + Number(payroll?.total_allowances))}
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
                            <tr className="bg-red-300">
                                <td className="font-semibold p-1">Total Potongan</td>
                                <td className="font-semibold text-right">Rp {formatNumber(payroll?.total_deductions)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-between items-start">
                    <h1 className="font-bold text-xs">Total Gaji Diterima:</h1>
                    <h1 className="font-bold text-lg">Rp {formatNumber(payroll?.net_pay)}</h1>
                </div>
            </div>
        </div>
    );
};

export default Payslip;
