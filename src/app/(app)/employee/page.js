"use client";
import { useCallback, useEffect, useState } from "react";
import MainPage from "../main";
import Input from "@/components/Input";
import Label from "@/components/Label";
import AttendanceForm from "./attendanceForm";
import AttendanceTable from "./AttendanceTable";
import SimpleLeaveCalendar from "./SimpleCalendar";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Calendar from "@/components/Calendar";
import AttenndanceCalendar from "./AttendanceCalendar";
import { DownloadIcon, FilterIcon, RefreshCcwIcon } from "lucide-react";
import { DateTimeNow, formatDateTime } from "@/libs/format";
import axios from "@/libs/axios";

const EmployeePage = () => {
    const [isModalAttendanceFormOpen, setIsModalAttendanceFormOpen] = useState(false);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const { thisMonth, today } = DateTimeNow();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [startDate, setStartDate] = useState(today);

    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState("");
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
    const [warehouses, setWarehouses] = useState([]);
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
        setIsModalAttendanceFormOpen(false);
        setIsModalFilterDataOpen(false);
    };

    // const calendarData = {
    //     "2025-11-01": { type: "attendance", status: "Hadir" },
    //     "2025-11-02": { type: "attendance", status: "Telat" },
    //     "2025-11-03": { type: "holiday", name: "Cuti Bersama" },
    //     "2025-11-05": { type: "event", name: "Meeting Bulanan" },
    // };
    return (
        <MainPage headerTitle="Absensi">
            <div className="py-4 sm:py-8 px-4 sm:px-12 overflow-x-auto">
                <div className="card p-4">
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
                    <div className="">
                        <select className="form-select" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                            <option value="">Semua Zona</option>
                            {zones?.map((zone) => (
                                <option key={zone?.id} value={zone?.id}>
                                    {zone?.zone_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* <SimpleLeaveCalendar /> */}
                    <Button
                        buttonType="primary"
                        className="mb-4 group text-nowrap"
                        onClick={() => {
                            setIsModalAttendanceFormOpen(true);
                        }}
                    >
                        Absensi
                    </Button>
                    <Modal isOpen={isModalAttendanceFormOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Absensi">
                        <div className="flex justify-center flex-col">
                            <AttendanceForm />
                        </div>
                    </Modal>
                    <AttendanceTable selectedZone={selectedZone} startDate={startDate} warehouses={warehouses} fetchWarehouses={fetchWarehouses} />
                    {/* <AttenndanceCalendar /> */}
                </div>
            </div>
        </MainPage>
    );
};

export default EmployeePage;
