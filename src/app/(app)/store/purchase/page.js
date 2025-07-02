"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Notification from "@/components/Notification";
import MainPage from "../../main";

const Purchase = () => {
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    return (
        <MainPage
            headerTitle={
                <>
                    Store / <span className="text-slate-500 font-light">Sales Order</span>
                </>
            }
        >
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="px-6 py-4 h-[60px]">
                <h1 className="text-2xl font-bold">Penjualan Barang</h1>
                <span className="text-sm text-slate-500">Penjualan barang online melalui AgenBRI Link</span>
            </div>
            <div className="grid grid-cols-3 h-[calc(100vh-140px)] p-4">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold">Penjualan Barang</h1>
                </div>
                <div className="bg-white rounded-s-3xl px-6 py-4">
                    <h1 className="text-2xl font-bold">Detail Order</h1>
                </div>
                <div className="bg-white rounded-e-3xl px-6 py-4">
                    <h1 className="text-2xl font-bold">Detail Order</h1>
                </div>
            </div>
        </MainPage>
    );
};

export default Purchase;
