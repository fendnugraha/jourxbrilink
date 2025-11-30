"use client";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Modal from "@/components/Modal";
import axios from "@/libs/axios";
import { formatDateTime, formatTime, todayDate } from "@/libs/format";
import { DownloadIcon, FilterIcon, RefreshCcwIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AttendanceDetail from "./attendanceDetail";
import Notification from "@/components/Notification";

const AttendanceTable = () => {
    const today = todayDate();
    const [notification, setNotification] = useState({
        type: "success",
        message: "test",
    });
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [errors, setErrors] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isModalWarehouseDetailOpen, setIsModalWarehouseDetailOpen] = useState(false);

    const fetchWarehouses = useCallback(async () => {
        try {
            const response = await axios.get(`/api/get-warehouse-attendance/${startDate}`);
            setWarehouses(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }, [startDate]);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
        setIsModalWarehouseDetailOpen(false);
    };
    return (
        <div className="card p-4">
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <h1 className="card-title mb-4">
                    Absensi Karyawan
                    <span className="card-subtitle">Tanggal: {formatDateTime(startDate)}</span>
                </h1>
                <div className="flex gap-1 justify-end h-fit">
                    <button className="small-button">
                        <RefreshCcwIcon className="size-4" />
                    </button>
                    <button className="small-button">
                        <DownloadIcon className="size-4" />
                    </button>
                    <button onClick={() => setIsModalFilterDataOpen(true)} className="small-button">
                        <FilterIcon className="size-4" />
                    </button>
                    <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                        <div className="mb-4">
                            <Label className="font-bold">Tanggal</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" />
                        </div>
                    </Modal>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table-auto table w-full text-xs">
                    <thead>
                        <tr>
                            <th className="">Cabang</th>
                            <th className="text-center">Zona</th>
                            <th className="text-center">Waktu Buka</th>
                            <th className="text-center">Jam Masuk</th>
                            <th className="">Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {warehouses?.map((warehouse) => (
                            <tr key={warehouse?.id}>
                                <td className="font-bold">
                                    {warehouse?.name}
                                    <span className="block text-slate-400 font-normal">{warehouse?.address}</span>
                                </td>
                                <td className="text-center">{warehouse?.zone_name}</td>
                                <td className="text-center text-2xl font-bold">{warehouse?.opening_time ?? "-"}</td>
                                <td className="text-center text-2xl font-bold">
                                    {warehouse?.attendance?.[0]?.created_at ? (
                                        warehouse?.attendance?.[0]?.time_in
                                    ) : (
                                        <span className="text-gray-400 text-xs font-normal">Belum absen</span>
                                    )}
                                </td>
                                <td className="text-center">
                                    <button
                                        onClick={() => {
                                            setSelectedWarehouse(warehouse);
                                            setIsModalWarehouseDetailOpen(true);
                                        }}
                                        className="small-button"
                                    >
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalWarehouseDetailOpen} onClose={closeModal} modalTitle="Detail" maxWidth="max-w-lg">
                <AttendanceDetail
                    selectedWarehouse={selectedWarehouse}
                    fetchWarehouses={fetchWarehouses}
                    notification={setNotification}
                    isModalOpen={setIsModalWarehouseDetailOpen}
                />
            </Modal>
        </div>
    );
};

export default AttendanceTable;
