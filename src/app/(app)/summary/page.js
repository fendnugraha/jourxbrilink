"use client";
import Notification from "@/components/notification";
import Header from "../Header";
import { useState } from "react";
import WarehouseBalance from "./components/WarehouseBalance";
import RevenueReport from "./components/RevenueReport";
import MutationHistory from "./components/MutationHistory";

const SummaryPage = () => {
    const [notification, setNotification] = useState("");
    return (
        <>
            {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
            <div className="">
                {/* <h1 className="text-2xl font-bold mb-4">Point of Sales - Add to Cart</h1> */}
                <Header title={"Summary Report"} />
                <div className="py-8">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <WarehouseBalance />
                        <RevenueReport />
                        <MutationHistory />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SummaryPage;
