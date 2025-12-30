"use client";
import Notification from "@/components/Notification";
import MainPage from "../../main";
import { useCallback, useEffect, useState } from "react";
import { DateTimeNow, formatLongDate, formatNumber, formatRupiah } from "@/libs/format";
import axios from "@/libs/axios";

const ProfilePage = () => {
    const { today } = DateTimeNow();
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [contactData, setContactData] = useState([]);
    const [employeeId, setEmployeeId] = useState(null);

    const fetchContactData = useCallback(async () => {
        try {
            const response = await axios.get("/api/get-contact-details", {
                params: {
                    contact_id: employeeId,
                    date: today,
                },
            });
            setContactData(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }, [month, year, employeeId]);

    useEffect(() => {
        fetchContactData();
    }, [fetchContactData]);

    const employee_receivable = contactData?.employee_receivables_sum?.total || 0;
    const installment_receivable = contactData?.installment_receivables_sum?.total || 0;

    const attGood = contactData?.attendances?.filter((item) => item.approval_status === "Good").length || 0;
    const attLate = contactData?.attendances?.filter((item) => item.approval_status === "Late").length || 0;
    const attOvertime = contactData?.attendances?.filter((item) => item.approval_status === "Overtime").length || 0;
    return (
        <MainPage headerTitle="My Profile">
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="py-4 sm:py-8 px-4 sm:px-12 overflow-x-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="card p-4">
                        <h1 className="card-title mb-4">
                            {contactData?.name}
                            <span className="card-subtitle">{contactData?.employee?.status}</span>
                        </h1>
                        <h1 className="font-semibold mb-2">Personal Information</h1>
                        <div className="overflow-x-auto mb-4">
                            <table className="table w-full text-xs">
                                <tbody>
                                    <tr>
                                        <td className="">Phone/WA</td>
                                        <td className="text-right">{contactData?.phone_number}</td>
                                    </tr>
                                    <tr>
                                        <td className="">Alamat</td>
                                        <td className="text-right">{contactData?.address}</td>
                                    </tr>
                                    <tr>
                                        <td className="">Tgl Bergabung</td>
                                        <td className="text-right">{contactData?.employee?.hire_date && formatLongDate(contactData?.employee?.hire_date)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <h1 className="font-semibold mb-2">Piutang</h1>
                        <div className="overflow-x-auto mb-4">
                            <table className="table w-full text-xs">
                                <tbody>
                                    <tr>
                                        <td className="">Kasbon</td>
                                        <td className="text-right">{formatRupiah(contactData?.employee_receivables_sum?.total || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td className="">Cicilan</td>
                                        <td className="text-right">{formatRupiah(contactData?.installment_receivables_sum?.total || 0)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td className="font-semibold">Total</td>
                                        <td className="text-right font-semibold">{formatRupiah(employee_receivable + installment_receivable)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <h1 className="font-semibold mb-2">Absensi</h1>
                        <div className="overflow-x-auto">
                            <table className="table w-full text-xs">
                                <tbody>
                                    <tr>
                                        <td className="">Paling Awal</td>
                                        <td className="text-right">{attGood}</td>
                                    </tr>
                                    <tr>
                                        <td className="">Lembur</td>
                                        <td className="text-right">{attOvertime}</td>
                                    </tr>
                                    <tr>
                                        <td className="">Terlambat</td>
                                        <td className="text-right">{attLate}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {contactData?.employee && (
                        <div className="card p-4 h-fit">
                            <h1 className="card-title mb-4">
                                Perkiraan Pendapatan
                                <span className="card-subtitle">Desember 2025</span>
                            </h1>
                            <h1 className="font-semibold mb-2">Pendapatan</h1>
                            <div className="overflow-x-auto mb-4">
                                <table className="table-auto w-full text-xs">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold p-1">Gaji Pokok</td>
                                            <td className="text-right">{formatRupiah(contactData?.employee?.salary || 0)}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold p-1">Tunjangan/Komisi</td>
                                            <td className="text-right">{formatRupiah(contactData?.employee?.commission || 0)}</td>
                                        </tr>
                                        {attOvertime > 0 && (
                                            <tr>
                                                <td className="font-semibold p-1">Lembur</td>
                                                <td className="text-right">{formatRupiah(attOvertime * 100000)}</td>
                                            </tr>
                                        )}
                                        <tr className="border-t border-slate-300 dark:border-slate-500">
                                            <td className="font-semibold p-1">Total Pendapatan</td>
                                            <td className="font-semibold text-right">
                                                {formatRupiah(
                                                    Number(contactData?.employee?.salary) +
                                                        Number(contactData?.employee?.commission) +
                                                        Number(attOvertime * 100000) || 0
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <h1 className="font-semibold mb-2">Potongan</h1>
                            <div className="overflow-x-auto mb-4">
                                <table className="table-auto w-full text-xs">
                                    <tbody>
                                        <tr>
                                            <td className="font-semibold p-1">Simpanan Wajib</td>
                                            <td className="text-right">{formatRupiah(100000)}</td>
                                        </tr>
                                        {employee_receivable > 0 && (
                                            <tr>
                                                <td className="font-semibold p-1">Kasbon</td>
                                                <td className="text-right">{formatRupiah(employee_receivable)}</td>
                                            </tr>
                                        )}
                                        {attLate > 0 && (
                                            <tr>
                                                <td className="font-semibold p-1">Denda Terlambat</td>
                                                <td className="text-right">{formatRupiah(attLate * 10000)}</td>
                                            </tr>
                                        )}
                                        <tr className="border-t border-slate-300 dark:border-slate-500">
                                            <td className="font-semibold p-1">Total Potongan</td>
                                            <td className="font-semibold text-right">
                                                {formatRupiah(Number(100000) + Number(employee_receivable) + Number(attLate * 10000))}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-end gap-2 items-start">
                                <h1 className="font-bold text-xs">Total Diterima:</h1>
                                <h1 className="font-bold text-2xl">
                                    {formatRupiah(
                                        Number(contactData?.employee?.salary) +
                                            Number(contactData?.employee?.commission) +
                                            Number(attOvertime * 100000) -
                                            Number(100000) -
                                            Number(employee_receivable) -
                                            Number(attLate * 10000) || 0
                                    )}
                                </h1>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainPage>
    );
};

export default ProfilePage;
