import { formatNumber } from "@/libs/format";

const PayrollDetail = ({ employee }) => {
    const totalIncome = Number(employee?.basic_salary) + Number(employee?.commission) + employee?.bonuses?.reduce((total, item) => total + item?.amount, 0);
    const totalDeduction = employee?.deductions?.reduce((total, item) => total + item?.amount, 0);
    return (
        <div>
            <h1 className="mb-4 font-bold">{employee?.name}</h1>
            <h1 className="font-bold text-sm">Pendapatan:</h1>
            <table className="table-auto w-full text-xs">
                <tbody>
                    <tr>
                        <td className="font-semibold p-1">Gaji Pokok</td>
                        <td className="text-right">Rp {formatNumber(employee?.basic_salary)}</td>
                    </tr>
                    <tr>
                        <td className="font-semibold p-1">Tunjangan/Komisi</td>
                        <td className="text-right">Rp {formatNumber(employee?.commission)}</td>
                    </tr>
                    {employee?.bonuses.length > 0 && (
                        <tr>
                            <td className="font-semibold p-1">Bonus</td>
                            <td className="text-right"></td>
                        </tr>
                    )}
                    {employee?.bonuses?.map((item, index) => (
                        <tr key={index}>
                            <td className="px-4 py-1">{item?.name}</td>
                            <td className="text-right">Rp {formatNumber(item?.amount)}</td>
                        </tr>
                    ))}
                    <tr className="border-t border-slate-300">
                        <td className="font-semibold p-1">Total Pendapatan</td>
                        <td className="font-semibold text-right">Rp {formatNumber(totalIncome)}</td>
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
                    {employee?.deductions?.map((item, index) => (
                        <tr key={index}>
                            <td className="px-4 py-1">{item?.name}</td>
                            <td className="text-right">Rp {formatNumber(item?.amount)}</td>
                        </tr>
                    ))}
                    <tr className="border-t border-slate-300">
                        <td className="font-semibold p-1">Total Potongan</td>
                        <td className="font-semibold text-right">Rp {formatNumber(totalDeduction)}</td>
                    </tr>
                </tbody>
            </table>
            <div className="mt-4 flex justify-between">
                <h1 className="font-bold text-sm mt-2">Total Gaji Diterima:</h1>
                <h1 className="font-bold text-sm">Rp {formatNumber(totalIncome - totalDeduction)}</h1>
            </div>
        </div>
    );
};

export default PayrollDetail;
