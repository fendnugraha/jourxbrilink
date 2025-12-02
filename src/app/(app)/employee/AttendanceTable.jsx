"use client";

import Modal from "@/components/Modal";
import { diffTimeHuman } from "@/libs/format";
import { Check, Clock, Star } from "lucide-react";
import { useState } from "react";
import AttendanceDetail from "./attendanceDetail";
import Notification from "@/components/Notification";
import { useAuth } from "@/libs/auth";

const AttendanceTable = ({ selectedZone, warehouses, fetchWarehouses }) => {
    const { user } = useAuth();
    const userRole = user?.role?.role;
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isModalWarehouseDetailOpen, setIsModalWarehouseDetailOpen] = useState(false);

    const closeModal = () => {
        setIsModalWarehouseDetailOpen(false);
    };

    const filteredWarehouses = warehouses.filter((warehouse) => {
        const zoneMatch = Number(warehouse.warehouse_zone_id) === Number(selectedZone);

        return !selectedZone || zoneMatch;
    });

    return (
        <div className="">
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}

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
                                                    <span>Telat {diffTimeHuman(warehouse?.opening_time, warehouse?.attendance?.[0]?.time_in)}</span>
                                                ) : (
                                                    <span>Lebih awal {diffTimeHuman(warehouse?.attendance?.[0]?.time_in, warehouse?.opening_time)}</span>
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
