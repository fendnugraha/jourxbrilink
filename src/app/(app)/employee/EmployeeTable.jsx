import Button from "@/components/Button";
import { useState } from "react";
import AddEmployee from "./AddEmployee";
import Modal from "@/components/Modal";
import { calculateWorkDuration, formatNumber } from "@/libs/format";
import DropdownMenu from "@/components/DropdownMenu";
import { Ellipsis } from "lucide-react";
import WarningForm from "./WarningForm";
import axios from "@/libs/axios";
import EditEmployee from "./EditEmployee";
import { formatDistanceToNow } from "date-fns";
import StatusBadge from "@/components/StatusBadge";

const EmployeeTable = ({ employees, fetchContacts, notification }) => {
    const [isModalAddEmployeeOpen, setIsModalAddEmployeeOpen] = useState(false);
    const [isModalAddWarningOpen, setIsModalAddWarningOpen] = useState(false);
    const [isModalEditEmployeeOpen, setIsModalEditEmployeeOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const closeModal = () => {
        setIsModalAddEmployeeOpen(false);
        setIsModalAddWarningOpen(false);
        setIsModalEditEmployeeOpen(false);
        setSelectedEmployee(null);
    };
    const [search, setSearch] = useState("");

    const findedEmployee = employees.find((emp) => emp.id === selectedEmployee) || null;

    return (
        <div className="card p-4">
            <h1 className="card-title mb-4">Daftar Karyawan</h1>
            <Button className="mb-4" onClick={() => setIsModalAddEmployeeOpen(true)}>
                Tambah Karyawan
            </Button>
            <Modal isOpen={isModalAddEmployeeOpen} onClose={closeModal} modalTitle="Tambah Karyawan" maxWidth="max-w-md">
                <AddEmployee isModalOpen={setIsModalAddEmployeeOpen} fetchContacts={fetchContacts} notification={notification} />
            </Modal>
            <div>
                <input type="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full table text-xs">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>Gaji Pokok</th>
                            <th>Komisi</th>
                            <th>Piutang</th>
                            <th>Join</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees
                            .filter((employee) => employee.contact?.name.toLowerCase().includes(search.toLowerCase()))
                            .map((employee, index) => (
                                <tr key={employee.id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>
                                        {employee.contact?.name}
                                        {employee.warning_active && (
                                            <div className="bg-red-400 rounded-full pe-2 text-white w-fit">
                                                <span className="font-bold bg-red-500 px-2 text-white text-xs rounded-full">
                                                    {employee.warning_active?.level}
                                                </span>{" "}
                                                Exp: {employee.warning_active?.expired_date}
                                            </div>
                                        )}
                                    </td>
                                    <td className="text-right">{formatNumber(employee.salary)}</td>
                                    <td className="text-right">{formatNumber(employee.commission)}</td>
                                    <td className="text-right">{formatNumber(employee.contact?.employee_receivables_sum?.total || 0)}</td>
                                    <td className="text-center">
                                        {employee.hire_date} <span className="text-xs text-slate-500 block">({calculateWorkDuration(employee.hire_date)})</span>
                                    </td>
                                    <td className="text-center">
                                        <StatusBadge
                                            status={employee?.status === "active" ? "Completed" : employee?.status === "terminated" ? "Rejected" : "Canceled"}
                                            statusText={
                                                employee?.status === "active" ? "Active" : employee?.status === "terminated" ? "Kicked Out" : "Inactive"
                                            }
                                        />
                                    </td>
                                    <td>
                                        <DropdownMenu
                                            title={<Ellipsis size={14} />}
                                            position="bottom end"
                                            className={"small-button"}
                                            items={[
                                                {
                                                    type: "button",
                                                    label: "Beri SP",
                                                    onClick: () => {
                                                        setSelectedEmployee(employee.id);
                                                        setIsModalAddWarningOpen(true);
                                                    },
                                                },
                                                {
                                                    type: "button",
                                                    label: "Edit",
                                                    onClick: () => {
                                                        setSelectedEmployee(employee.id);
                                                        setIsModalEditEmployeeOpen(true);
                                                    },
                                                },
                                                {
                                                    type: "link",
                                                    label: "Detail",
                                                    href: `#`,
                                                },
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalAddWarningOpen} onClose={closeModal} modalTitle="Beri Peringatan" maxWidth="max-w-md">
                <WarningForm isModalOpen={setIsModalAddWarningOpen} employee={findedEmployee} fetchContacts={fetchContacts} notification={notification} />
            </Modal>
            <Modal isOpen={isModalEditEmployeeOpen} onClose={closeModal} modalTitle="Edit Karyawan" maxWidth="max-w-md">
                <EditEmployee isModalOpen={setIsModalEditEmployeeOpen} employee={findedEmployee} fetchContacts={fetchContacts} notification={notification} />
            </Modal>
        </div>
    );
};

export default EmployeeTable;
