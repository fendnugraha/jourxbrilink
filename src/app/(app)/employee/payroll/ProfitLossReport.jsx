import SimplePagination from "@/components/SimplePagination";
import axios from "@/libs/axios";
import { DateTimeNow, formatNumber, getMonthYear } from "@/libs/format";
import useGetWarehouses from "@/libs/getAllWarehouse";
import { useCallback, useEffect, useState } from "react";

const ProfitLossReport = ({ notification }) => {
    const { warehouses, warehousesError } = useGetWarehouses();
    const { thisMonth, thisYear } = DateTimeNow();
    const [month, setMonth] = useState(thisMonth);
    const [year, setYear] = useState(thisYear);
    const [profiitLoss, setProfiitLoss] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectWarehouse, setSelectWarehouse] = useState("all");
    const selectedWarehouse = warehouses.data?.find((warehouse) => warehouse.id === Number(selectWarehouse));

    const fetchProfiitLoss = useCallback(async () => {
        try {
            const response = await axios.get(`/api/get-profit-loss-report/${selectWarehouse}/${month}/${year}`);
            setProfiitLoss(response.data.data);
        } catch (error) {
            notification({ type: "error", message: error.response.data.message });
            console.log(error);
        }
    }, [selectWarehouse, month, year]);

    useEffect(() => {
        fetchProfiitLoss();
        setCurrentPage(1);
    }, [fetchProfiitLoss]);

    const totalProfit = profiitLoss.journal?.reduce((total, item) => total + Number(item.total_fee_positive), 0);
    const totalLoss = profiitLoss.journal?.reduce((total, item) => total + Number(item.total_fee_negative), 0);
    const payrollTotal =
        selectWarehouse === "all"
            ? Number(profiitLoss.payrollTotal?.total_gross_pay) +
              Number(profiitLoss.payrollTotal?.total_commissions) +
              Number(profiitLoss.payrollTotal?.total_allowances)
            : Number(profiitLoss.warehouse_data?.[0]?.contact?.employee?.payroll?.[0]?.total_gross_pay) +
                  Number(profiitLoss.warehouse_data?.[0]?.contact?.employee?.payroll?.[0]?.total_commissions) +
                  Number(profiitLoss.warehouse_data?.[0]?.contact?.employee?.payroll?.[0]?.total_allowances) || 0;

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate the total number of pages
    const totalItems = profiitLoss.expenses?.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get the items for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = profiitLoss.expenses?.slice(startIndex, startIndex + itemsPerPage);

    // Handle page change from the Pagination component
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    return (
        <>
            <div className="mb-4 flex gap-2">
                <select className="form-select" value={selectWarehouse} onChange={(e) => setSelectWarehouse(e.target.value)}>
                    <option value="all">Semua Cabang</option>
                    {warehouses.data?.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                        </option>
                    ))}
                </select>
                <select className="form-select !w-72" value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option>Pilih Bulan</option>
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
                <select className="form-select !w-fit" value={year} onChange={(e) => setYear(e.target.value)}>
                    <option>Pilih Tahun</option>
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                    <option value={2029}>2029</option>
                    <option value={2030}>2030</option>
                </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <div className="card p-4">
                        <h1 className="card-title mb-4">
                            {selectedWarehouse ? selectedWarehouse.name : "Semua Cabang"}
                            <span className="card-subtitle">{getMonthYear(month, year)}</span>
                        </h1>
                        <div className="overflow-x-auto">
                            <table className="table w-full text-xs">
                                <thead>
                                    <tr>
                                        <th>Tipe Transaksi</th>
                                        <th>Profit</th>
                                        <th>Biaya</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profiitLoss.journal?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.trx_type}</td>
                                            <td className="text-right">{item.total_fee_positive > 0 && formatNumber(item.total_fee_positive)}</td>
                                            <td className="text-right">{item.total_fee_negative < 0 && formatNumber(item.total_fee_negative * -1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colSpan={2} className="font-bold">
                                            Gross Profit
                                        </th>
                                        <th className="font-bold text-right">{formatNumber(totalProfit + totalLoss)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="card p-4 mt-4">
                        <h1 className="card-title mb-4">
                            Biaya Operasional
                            <span className="card-subtitle">Total: Rp{formatNumber(totalLoss * -1)}</span>
                        </h1>
                        <div className="overflow-x-auto">
                            <table className="table table-fixed w-full text-xs">
                                <thead>
                                    <tr>
                                        <th className="w-[70%] text-left">Keterangan</th>
                                        <th className="w-[30%] text-right">Rp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="!whitespace-normal wrap-break-word">{item.description}</td>
                                            <td className="text-right">{item.fee_amount < 0 && formatNumber(item.fee_amount * -1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <SimplePagination totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} />
                        )}
                    </div>
                </div>
                <div className="">
                    {selectWarehouse !== "all" && (
                        <div className="card p-4 mb-4">
                            <h1 className="card-title mb-4">
                                {profiitLoss.warehouse_data?.[0]?.contact?.name}
                                <span className="card-subtitle">Kasir</span>
                            </h1>
                        </div>
                    )}
                    <div className="card p-4 mb-4">
                        <h1 className="card-title mb-4">Summary</h1>
                        <div className="overflow-x-auto">
                            <table className="table table-fixed w-full text-xs">
                                <tbody>
                                    <tr>
                                        <td className="!whitespace-normal wrap-break-word">Pendapatan</td>
                                        <td className="text-right">{formatNumber(totalProfit)}</td>
                                    </tr>
                                    <tr>
                                        <td className="!whitespace-normal wrap-break-word">Gaji Karyawan</td>
                                        <td className="text-right">{formatNumber(payrollTotal || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td className="!whitespace-normal wrap-break-word">Biaya Operasional</td>
                                        <td className="text-right">{formatNumber(totalLoss)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th className="font-bold">Net Profit</th>
                                        <th className="font-bold text-right">{formatNumber(totalProfit - payrollTotal + totalLoss ?? 0)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfitLossReport;
