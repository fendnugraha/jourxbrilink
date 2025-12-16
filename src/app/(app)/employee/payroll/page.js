"use client";
import Notification from "@/components/Notification";
import MainPage from "../../main";
import { use, useCallback, useEffect, useState } from "react";
import SubNavsEmployee from "./SubNavs";
import EmployeeTable from "../EmployeeTable";
import axios from "@/libs/axios";
import ReceivableContent from "./receivable/ReceivableContent";
import PayrollSection from "./PayrollSection";
import { DateTimeNow } from "@/libs/format";

const PayrollPage = () => {
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const { thisMonth, thisYear } = DateTimeNow();
    const [month, setMonth] = useState(thisMonth);
    const [year, setYear] = useState(thisYear);

    const [selectPage, setSelectPage] = useState("list");
    const [employees, setEmployees] = useState([]);

    const fetchContacts = useCallback(
        async (url = "/api/employees") => {
            try {
                const response = await axios.get(url, { params: { month, year } });
                setEmployees(response.data.data);
            } catch (error) {
                console.log(error);
            }
        },
        [month, year]
    );

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    return (
        <MainPage headerTitle="Payroll">
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="py-4 sm:py-8 px-4 sm:px-12 overflow-x-auto">
                <SubNavsEmployee selectPage={selectPage} setSelectPage={setSelectPage} />
                {selectPage === "list" && <EmployeeTable employees={employees} fetchContacts={fetchContacts} notification={setNotification} />}
                {selectPage === "receivable" && <ReceivableContent employees={employees} fetchContacts={fetchContacts} notification={setNotification} />}
                {selectPage === "payroll" && (
                    <PayrollSection
                        employees={employees}
                        fetchContacts={fetchContacts}
                        notification={setNotification}
                        month={month}
                        year={year}
                        setMonth={setMonth}
                        setYear={setYear}
                    />
                )}
            </div>
        </MainPage>
    );
};

export default PayrollPage;
