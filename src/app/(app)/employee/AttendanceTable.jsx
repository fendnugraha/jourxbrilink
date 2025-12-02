"use client";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Modal from "@/components/Modal";
import axios from "@/libs/axios";
import { DateTimeNow, diffHuman, formatDateTime, formatTime, todayDate } from "@/libs/format";
import { Check, Clock, DownloadIcon, FilterIcon, RefreshCcwIcon, Star, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AttendanceDetail from "./attendanceDetail";
import Notification from "@/components/Notification";
import { useAuth } from "@/libs/auth";

const AttendanceTable = () => {
    const { user } = useAuth();
    const userRole = user?.role?.role;
    const { thisMonth, today } = DateTimeNow();
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(today);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState("");
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

    const fetchZones = useCallback(async () => {
        try {
            const response = await axios.get("/api/zones");
            setZones(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
        setIsModalWarehouseDetailOpen(false);
    };

    const filteredWarehouses = warehouses.filter((warehouse) => {
        const zoneMatch = Number(warehouse.warehouse_zone_id) === Number(selectedZone);

        return !selectedZone || zoneMatch;
    });

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
                    <button className="small-button" onClick={() => fetchWarehouses()}>
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
                            <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" />
                        </div>
                    </Modal>
                </div>
            </div>
            <div>
                <select className="form-select" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                    <option value="">Semua Zona</option>
                    {zones?.map((zone) => (
                        <option key={zone?.id} value={zone?.id}>
                            {zone?.zone_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="table-auto table w-full text-xs">
                    <thead>
                        <tr>
                            <th className="">Cabang</th>
                            <th className="text-center">Zona</th>
                            <th className="text-center">Waktu Buka</th>
                            <th className="text-center">Jam Masuk</th>
                            <th className="text-center">Rating</th>
                            <th className="">Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWarehouses?.map((warehouse) => (
                            <tr key={warehouse?.id}>
                                <td className="font-bold">
                                    <div className="flex items-center">
                                        {warehouse?.attendance?.[0]?.approval_status ? (
                                            <img src={warehouse?.attendance?.[0]?.photo_url} alt={warehouse?.name} className="w-8 h-8 rounded-full mr-2" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
                                        )}
                                        <div>
                                            {warehouse?.name}
                                            <span className="block text-slate-400 font-normal">{warehouse?.address}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center">{warehouse?.zone?.zone_name}</td>
                                <td className="text-center text-2xl font-bold">{warehouse?.opening_time ?? "-"}</td>
                                <td className="text-center text-2xl font-bold">
                                    {warehouse?.attendance?.[0]?.created_at ? (
                                        <>
                                            {warehouse?.attendance?.[0]?.time_in}
                                            <span className="block text-slate-400 font-normal text-xs">
                                                {" "}
                                                {warehouse?.attendance?.[0]?.approval_status === "Late" ? (
                                                    <span>Telat {diffHuman(warehouse?.opening_time, warehouse?.attendance?.[0]?.time_in)}</span>
                                                ) : (
                                                    <span>Lebih awal {diffHuman(warehouse?.attendance?.[0]?.time_in, warehouse?.opening_time)}</span>
                                                )}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400 text-xs font-normal">Belum absen</span>
                                    )}
                                </td>
                                <td className="text-center">
                                    {warehouse?.attendance?.[0]?.approval_status === "Late" ? (
                                        <Clock size={20} className="text-red-500" />
                                    ) : warehouse?.attendance?.[0]?.approval_status === "Good" ? (
                                        <Star size={20} className="text-yellow-300" fill="yellow" />
                                    ) : (
                                        <Check size={20} className="text-green-500" />
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
            <Modal isOpen={isModalWarehouseDetailOpen} onClose={closeModal} modalTitle="Detail" maxWidth="max-w-xl">
                <AttendanceDetail
                    selectedWarehouse={selectedWarehouse}
                    fetchWarehouses={fetchWarehouses}
                    notification={setNotification}
                    isModalOpen={setIsModalWarehouseDetailOpen}
                    userRole={userRole}
                />
            </Modal>
        </div>
    );
};

export default AttendanceTable;
