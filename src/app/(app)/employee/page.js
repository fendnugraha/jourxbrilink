import Link from "next/link";
import MainPage from "../main";
import { BookUser, Receipt } from "lucide-react";

const EmployeesPage = () => {
    return (
        <MainPage headerTitle="Employees">
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                <ul className="flex flex-col w-1/2 card">
                    <Link href="/employee/attendance">
                        <li className="border-b p-2 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600">
                            <button className="px-4 w-full text-start py-2 cursor-pointer flex items-center gap-2">
                                <BookUser size={20} />
                                Absensi Karyawan
                            </button>
                        </li>
                    </Link>
                    <Link href="/employee/payroll">
                        <li className="border-b p-2 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600">
                            <button className="px-4 w-full text-start py-2 cursor-pointer flex items-center gap-2">
                                <Receipt size={20} />
                                Gaji & Potongan
                            </button>
                        </li>
                    </Link>
                </ul>
            </div>
        </MainPage>
    );
};

export default EmployeesPage;
