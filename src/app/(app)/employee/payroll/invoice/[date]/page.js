"use client";
import MainPage from "@/app/(app)/main";
import axios from "@/libs/axios";
import { formatNumber } from "@/libs/format";
import { use, useCallback, useEffect, useState } from "react";
import Payslip from "./Payslip";

const PayrollInvoices = ({ params }) => {
    const { date } = use(params);

    const [payrolls, setPayrolls] = useState([]);
    const fetchPayrolls = useCallback(async () => {
        try {
            const response = await axios.get(`/api/get-payroll-by-date/${date}`);
            setPayrolls(response.data.data);
        } catch (error) {
            console.error(error);
        }
    }, [date]);

    useEffect(() => {
        fetchPayrolls();
    }, [fetchPayrolls]);

    return (
        <MainPage headerTitle="Payroll Invoice">
            <button
                onClick={() => {
                    setTimeout(() => {
                        window.print();
                    }, 100);
                }}
                className="small-button mb-2"
            >
                Cetak Nota
            </button>

            <div id="print-area" className="grid grid-cols-3 gap-2 bg-white w-[1000px] p-2">
                {payrolls.map((payroll) => (
                    <Payslip key={payroll?.id} payroll={payroll} date={date} />
                ))}
            </div>
        </MainPage>
    );
};

export default PayrollInvoices;
