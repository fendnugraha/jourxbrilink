import Button from "@/components/Button";
import Modal from "@/components/Modal";
import PayrollDetail from "./PayrollDetail";
import { use, useEffect, useState } from "react";
import { AlarmClockPlus, Clock, Ellipsis, Minus, Plus, Receipt, ReceiptText, Star } from "lucide-react";
import { DateTimeNow, formatNumber } from "@/libs/format";
import axios from "@/libs/axios";
import DropdownMenu from "@/components/DropdownMenu";

const CreatePayroll = ({ employees, notification }) => {
    const { thisMonth, thisYear } = DateTimeNow();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [isModalPayrollDetailOpen, setIsModalPayrollDetailOpen] = useState(false);
    const [isModalAddBonusOpen, setIsModalAddBonusOpen] = useState(false);
    const [isModalAddDeductionOpen, setIsModalAddDeductionOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isReceivable, setIsReceivable] = useState(false);
    const [processData, setProcessData] = useState(() => {
        const saved = localStorage.getItem("processData");
        return saved ? JSON.parse(saved) : [];
    });
    const [bonusName, setBonusName] = useState("");
    const [bonusAmount, setBonusAmount] = useState("");

    const [deductionName, setDeductionName] = useState("");
    const [deductionAmount, setDeductionAmount] = useState("");

    const [month, setMonth] = useState(thisMonth);
    const [year, setYear] = useState(thisYear);

    const closeModal = () => {
        setIsModalPayrollDetailOpen(false);
        setIsModalAddBonusOpen(false);
        setIsModalAddDeductionOpen(false);
    };

    const findedEmployee = employees.find((emp) => emp.id === selectedEmployee);

    const AddToProcessData = (employees, month, year) => {
        const payload = employees.map((employee) => {
            const lateCount = employee.attendances.filter((item) => item.approval_status === "Late").length;
            const overtimeCount = employee.attendances.filter((item) => item.approval_status === "Overtime").length;

            return {
                employee_id: employee.id,
                name: employee.contact?.name,
                basic_salary: employee.salary,
                commission: employee.commission,
                month,
                year,
                attendances: employee.attendances,
                bonuses: [
                    ...(overtimeCount > 0
                        ? [
                              {
                                  name: "Lembur",
                                  amount: overtimeCount * 100000,
                              },
                          ]
                        : []),
                ],
                deductions: [
                    {
                        name: "Simpanan Wajib",
                        amount: 100000,
                    },
                    ...(lateCount > 0
                        ? [
                              {
                                  name: "Denda Keterlambatan",
                                  amount: lateCount * 10000,
                              },
                          ]
                        : []),
                ],
            };
        });

        setProcessData(payload);
        localStorage.setItem("processData", JSON.stringify(payload));
    };

    const totalSalary = processData.reduce((total, item) => total + Number(item.basic_salary), 0);
    const totalCommission = processData.reduce((total, item) => total + Number(item.commission), 0);
    const totalBonus = processData.reduce((total, item) => total + item.bonuses.reduce((total, bonus) => total + bonus.amount, 0), 0);
    const totalDeduction = processData.reduce((total, item) => total + item.deductions.reduce((total, deduction) => total + deduction.amount, 0), 0);

    const calculateTotalItem = (item) => {
        const total =
            Number(item.basic_salary) +
            Number(item.commission) +
            item.bonuses.reduce((total, bonus) => total + bonus.amount, 0) -
            item.deductions.reduce((total, deduction) => total + deduction.amount, 0);
        return formatNumber(total);
    };

    const addBonus = (employeeId) => {
        if (!bonusName || !bonusAmount) return;

        const bonus = {
            name: bonusName,
            amount: Number(bonusAmount),
        };

        setProcessData((prev) => {
            const updated = prev.map((item) => (item.employee_id === employeeId ? { ...item, bonuses: [...item.bonuses, bonus] } : item));

            localStorage.setItem("processData", JSON.stringify(updated));
            return updated;
        });

        // reset form
        setBonusName("");
        setBonusAmount("");
    };

    const removeBonus = (employeeId, index) => {
        setProcessData((prev) => {
            const updated = prev.map((item) => (item.employee_id === employeeId ? { ...item, bonuses: item.bonuses.filter((_, i) => i !== index) } : item));

            localStorage.setItem("processData", JSON.stringify(updated));
            return updated;
        });
    };

    const addDeduction = (employeeId) => {
        if (!deductionName || !deductionAmount) return;

        const deduction = {
            name: deductionName,
            amount: Number(deductionAmount),
        };

        setProcessData((prev) => {
            const updated = prev.map((item) => (item.employee_id === employeeId ? { ...item, deductions: [...item.deductions, deduction] } : item));

            localStorage.setItem("processData", JSON.stringify(updated));
            return updated;
        });

        // reset form
        setDeductionName("");
        setDeductionAmount("");
        setIsReceivable(false);
    };

    const removeDeduction = (employeeId, index) => {
        setProcessData((prev) => {
            const updated = prev.map((item) =>
                item.employee_id === employeeId ? { ...item, deductions: item.deductions.filter((_, i) => i !== index) } : item
            );

            localStorage.setItem("processData", JSON.stringify(updated));
            return updated;
        });
    };

    const clearProcessData = () => {
        localStorage.removeItem("processData");
        setProcessData([]);
    };

    const findedEmployeeProcessData = processData.find((emp) => emp.employee_id === selectedEmployee);

    useEffect(() => {
        if (isReceivable) {
            setDeductionName("Potong Kasbon");
        } else {
            setDeductionName("");
        }
    }, [isReceivable]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!processData.length) {
            notification({
                type: "error",
                message: "Data payroll masih kosong",
            });
            return;
        }

        if (!month || !year) {
            notification({
                type: "error",
                message: "Bulan dan tahun wajib diisi",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("/api/store-payroll", {
                employees: processData,
                month,
                year,
            });

            notification({
                type: "success",
                message: response.data.message || "Payroll berhasil disimpan",
            });

            clearProcessData();
        } catch (error) {
            console.error(error);

            notification({
                type: "error",
                message: error.response?.data?.message || "Terjadi kesalahan saat menyimpan payroll",
            });
        } finally {
            setLoading(false);
        }
    };

    const optionItems = [
        {
            type: "button",
            label: "Tambah Bonus",
            onClick: () => {
                setSelectedEmployee(employee.employee_id);
                setIsModalAddDeductionOpen(true);
            },
        },
    ];
    return (
        <div>
            <div className="flex gap-2 w-fit">
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
                {processData.length === 0 ? (
                    <Button buttonType="success" className="" onClick={() => AddToProcessData(employees, month, year)}>
                        Buat
                    </Button>
                ) : (
                    <Button buttonType="danger" className="" onClick={() => clearProcessData()}>
                        Reset
                    </Button>
                )}
            </div>
            <div className="mt-4 flex gap-2">
                <input type="search" className="form-control" placeholder="Cari" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Button buttonType="info" className="" onClick={handleSubmit} disabled={loading || !processData.length}>
                    Proses
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="overflow-x-auto sm:col-span-3">
                    <table className="table w-full text-xs ">
                        <thead>
                            <tr className="">
                                <th className="">Karyawan</th>
                                <th className="">Gaji Pokok</th>
                                <th className="">Komisi</th>
                                <th className="">Bonus</th>
                                <th className="">Potongan</th>
                                <th className="">Total Diterima</th>
                                <th className="">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processData
                                .filter((emp) => emp.name.toLowerCase().includes(search.toLowerCase()))
                                .map((employee) => (
                                    <tr key={employee.employee_id}>
                                        <td className="font-semibold">
                                            {employee.name}
                                            <div className="flex gap-4 items-center font-normal">
                                                <div className="flex gap-1 items-center">
                                                    <Star size={12} fill="yellow" className="text-amber-500" />
                                                    {employee.attendances?.filter((a) => a.approval_status === "Good").length}
                                                </div>
                                                <div className="flex gap-1 items-center">
                                                    <AlarmClockPlus size={12} className="text-violet-500" />
                                                    {employee.attendances?.filter((a) => a.approval_status === "Overtime").length}
                                                </div>
                                                <div className="flex gap-1 items-center">
                                                    <Clock size={12} className="text-red-500" />
                                                    {employee.attendances?.filter((a) => a.approval_status === "Late").length}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-right">{formatNumber(employee.basic_salary)}</td>
                                        <td className="text-right">{formatNumber(employee.commission)}</td>
                                        <td className="text-right">{formatNumber(employee.bonuses.reduce((total, bonus) => total + bonus.amount, 0))}</td>
                                        <td className="text-right">
                                            {formatNumber(employee.deductions.reduce((total, deduction) => total + deduction.amount, 0))}
                                        </td>
                                        <td className="text-right font-bold">{calculateTotalItem(employee)}</td>
                                        <td className="text-center">
                                            <DropdownMenu
                                                title={<Ellipsis size={14} />}
                                                position="bottom end"
                                                className={"small-button"}
                                                items={[
                                                    {
                                                        type: "button",
                                                        label: "Tambah Bonus",
                                                        onClick: () => {
                                                            setSelectedEmployee(employee.employee_id);
                                                            setIsModalAddBonusOpen(true);
                                                        },
                                                    },
                                                    {
                                                        type: "button",
                                                        label: "Tambah Potongan",
                                                        onClick: () => {
                                                            setSelectedEmployee(employee.employee_id);
                                                            setIsModalAddDeductionOpen(true);
                                                        },
                                                    },
                                                    {
                                                        type: "button",
                                                        label: "Detail",
                                                        onClick: () => {
                                                            setSelectedEmployee(employee.employee_id);
                                                            setIsModalPayrollDetailOpen(true);
                                                        },
                                                    },
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <div className="sm:col-span-1 py-2">
                    <h1 className="font-bold text-sm">Ringkasan</h1>
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <h1 className="">Total Gaji Pokok</h1>
                            <h1 className=" text-right">{formatNumber(totalSalary)}</h1>
                        </div>
                        <div className="flex justify-between">
                            <h1 className="">Total Tunjangan</h1>
                            <h1 className=" text-right">{formatNumber(totalCommission)}</h1>
                        </div>
                        <div className="flex justify-between">
                            <h1 className="">Total Bonus</h1>
                            <h1 className=" text-right">{formatNumber(totalBonus)}</h1>
                        </div>
                        <div className="flex justify-between">
                            <h1 className="">Total Potongan</h1>
                            <h1 className=" text-right">{formatNumber(totalDeduction && totalDeduction * -1)}</h1>
                        </div>
                        <div className="flex justify-between border-t border-slate-300 pt-1">
                            <h1 className="font-bold">Total Diterima</h1>
                            <h1 className="font-bold text-right">{formatNumber(totalSalary + totalCommission + totalBonus - totalDeduction)}</h1>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalPayrollDetailOpen} onClose={closeModal} modalTitle="Detail Karyawan" maxWidth="max-w-lg">
                <PayrollDetail employee={findedEmployeeProcessData} />
            </Modal>
            <Modal isOpen={isModalAddBonusOpen} onClose={closeModal} modalTitle="Tambah Bonus" maxWidth="max-w-2xl">
                <h1 className="font-bold">{findedEmployee?.contact?.name}</h1>
                <div className="grid grid-cols-2 gap-4">
                    <form>
                        <div>
                            <label className="text-sm">Nama Bonus</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Contoh: Bonus Absensi"
                                value={bonusName}
                                onChange={(e) => setBonusName(e.target.value || "")}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm">Jumlah</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Rp"
                                value={bonusAmount}
                                onChange={(e) => setBonusAmount(e.target.value || 0)}
                                required
                            />
                        </div>
                        <Button buttonType="success" type="button" className="mt-2" onClick={() => addBonus(selectedEmployee)}>
                            Simpan
                        </Button>
                    </form>
                    <div>
                        <h1 className="font-bold">Detail Bonus</h1>
                        <ul className="text-sm">
                            {processData
                                .find((emp) => emp.employee_id === selectedEmployee)
                                ?.bonuses.map((bonus, index) => (
                                    <li className="flex justify-between" key={index}>
                                        <span className="">{bonus.name}</span>
                                        <div className="flex gap-2 items-center">
                                            <span>Rp {formatNumber(bonus.amount)}</span>
                                            <button
                                                onClick={() => removeBonus(selectedEmployee, index)}
                                                className="hover:underline bg-red-500 hover:bg-red-400 text-white p-0.5 rounded-full"
                                            >
                                                <Minus size={12} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isModalAddDeductionOpen} onClose={closeModal} modalTitle="Tambah Potongan" maxWidth="max-w-2xl">
                <h1 className="font-bold">{findedEmployee?.contact?.name}</h1>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div>
                            <label className="text-sm">Nama Potongan</label>
                            <input
                                value={deductionName}
                                onChange={(e) => setDeductionName(e.target.value || "")}
                                type="text"
                                className="form-control"
                                placeholder="Contoh: Denda Terlambat"
                                required
                                disabled={isReceivable}
                            />
                        </div>
                        <input
                            type="checkbox"
                            id="isReceivable"
                            className="mb-2 mr-2"
                            checked={isReceivable}
                            onChange={(e) => {
                                setIsReceivable(e.target.checked);
                            }}
                        />
                        <label htmlFor="isReceivable" className={`text-sm `}>
                            Potong Kasbon
                        </label>
                        <div>
                            <label className="text-sm">Jumlah</label>
                            <input
                                value={deductionAmount}
                                onChange={(e) => setDeductionAmount(e.target.value || 0)}
                                type="number"
                                className="form-control"
                                placeholder="Rp"
                                required
                            />
                        </div>
                        <Button buttonType="success" className="mt-2" onClick={() => addDeduction(selectedEmployee)}>
                            Simpan
                        </Button>
                    </div>
                    <div>
                        <h1 className="font-bold">Detail Potongan</h1>
                        <ul className="text-sm">
                            {processData
                                .find((emp) => emp.employee_id === selectedEmployee)
                                ?.deductions.map((deduction, index) => (
                                    <li className="flex justify-between" key={index}>
                                        <span className="">{deduction.name}</span>
                                        <div className="flex gap-2 items-center">
                                            <span>Rp {formatNumber(deduction.amount)}</span>
                                            <button
                                                onClick={() => removeDeduction(selectedEmployee, index)}
                                                className="hover:underline bg-red-500 hover:bg-red-400 text-white p-0.5 rounded-full"
                                            >
                                                <Minus size={12} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CreatePayroll;
