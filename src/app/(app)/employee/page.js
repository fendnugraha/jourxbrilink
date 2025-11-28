"use client";
import { useState } from "react";
import MainPage from "../main";
import AttendanceForm from "./attendanceForm";
import AttendanceTable from "./AttendanceTable";
import SimpleLeaveCalendar from "./SimpleCalendar";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

const EmployeePage = () => {
    const [isModalAttendanceFormOpen, setIsModalAttendanceFormOpen] = useState(false);

    const closeModal = () => {
        setIsModalAttendanceFormOpen(false);
    };
    return (
        <MainPage headerTitle="Employee">
            <div className="py-4 sm:py-8 px-4 sm:px-12 overflow-x-auto">
                {/* <SimpleLeaveCalendar /> */}
                {/* <AttendanceForm /> */}
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
                    <AttendanceForm />
                </Modal>
                <AttendanceTable />
            </div>
        </MainPage>
    );
};

export default EmployeePage;
