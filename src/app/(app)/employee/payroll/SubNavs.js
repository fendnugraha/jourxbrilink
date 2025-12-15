const SubNavsEmployee = ({ selectPage, setSelectPage }) => {
    return (
        <div className="mb-4 bg-slate-300 dark:bg-slate-50 w-fit rounded-lg flex gap-2 items-center justify-center p-0.5 text-sm">
            <button
                className={`${selectPage === "list" ? "bg-slate-800 text-white" : "text-slate-600"} px-4 py-1 rounded-lg min-w-32`}
                onClick={() => setSelectPage("list")}
            >
                Daftar Karyawan
            </button>
            <button
                className={`${selectPage === "payroll" ? "bg-slate-800 text-white" : "text-slate-600"} px-4 py-1 rounded-lg min-w-32`}
                onClick={() => setSelectPage("payroll")}
            >
                Pembayaran Gaji
            </button>

            <button
                className={`${selectPage === "receivable" ? "bg-slate-800 text-white" : "text-slate-600"} px-4 py-1 rounded-lg min-w-32`}
                onClick={() => setSelectPage("receivable")}
            >
                Piutang Karyawan
            </button>
            <button
                className={`${selectPage === "report" ? "bg-slate-800 text-white" : "text-slate-600"} px-4 py-1 rounded-lg min-w-32`}
                onClick={() => setSelectPage("report")}
            >
                Laporan Keuangan
            </button>
        </div>
    );
};

export default SubNavsEmployee;
