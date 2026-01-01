import { useState } from "react";
import CreatePayroll from "./CreatePayroll";
import PayrollTable from "./PayrollTable";
import PayrollTableDetail from "./PayrollTableDetail";

const PayrollSection = ({ employees, fetchContacts, notification, month, year, setMonth, setYear }) => {
    const [selectSection, setSelectSection] = useState("payroll-table");
    return (
        <div className="card p-4">
            <div className="mb-4 bg-slate-300 dark:bg-slate-50 w-fit rounded-lg flex gap-2 items-center justify-center p-0.5 text-sm">
                <button
                    className={`${selectSection === "payrollPayement" ? "bg-slate-800 text-white" : "text-slate-600"} px-4 py-1 rounded-lg min-w-32`}
                    onClick={() => setSelectSection("payrollPayement")}
                >
                    Buat Baru
                </button>
                <button
                    className={`${selectSection === "payroll-table" ? "bg-slate-800 text-white" : "text-slate-600"} px-4 py-1 rounded-lg min-w-32`}
                    onClick={() => setSelectSection("payroll-table")}
                >
                    Report
                </button>
                <button
                    className={`${selectSection === "payroll-detail" ? "bg-slate-800 text-white" : "text-slate-600"} px-4 py-1 rounded-lg min-w-32`}
                    onClick={() => setSelectSection("payroll-detail")}
                >
                    Detail
                </button>
            </div>

            {selectSection === "payrollPayement" && (
                <CreatePayroll
                    employees={employees}
                    fetchContacts={fetchContacts}
                    notification={notification}
                    month={month}
                    year={year}
                    setMonth={setMonth}
                    setYear={setYear}
                />
            )}
            {selectSection === "payroll-table" && <PayrollTable />}
            {selectSection === "payroll-detail" && <PayrollTableDetail />}
        </div>
    );
};

export default PayrollSection;
