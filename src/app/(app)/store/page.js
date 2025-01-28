"use client";
import Notification from "@/components/notification";
import Header from "../Header";
import { useState } from "react";

const StorePage = () => {
    const [notification, setNotification] = useState("");
    return (
        <>
            {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
            <div className="">
                {/* <h1 className="text-2xl font-bold mb-4">Point of Sales - Add to Cart</h1> */}
                <Header title={"Store"} />
                <div className="py-8">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8"></div>
                </div>
            </div>
        </>
    );
};

export default StorePage;
