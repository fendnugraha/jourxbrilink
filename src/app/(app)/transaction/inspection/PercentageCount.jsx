import axios from "@/libs/axios";
import { useCallback, useEffect, useState } from "react";

const PercentageCount = ({ startDate, endDate }) => {
    const [trxByWarehouse, setTrxByWarehouse] = useState([]);
    const fetchtrxByWarehouse = useCallback(async () => {
        try {
            const response = await axios.get(`/api/calculate-trx-by-warehouse/${startDate}/${endDate}`);
            setTrxByWarehouse(response.data.data);
        } catch (error) {
            console.error(error);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchtrxByWarehouse();
    }, [fetchtrxByWarehouse]);

    const calculatePercentage = (a, b) => {
        if (b === 0) {
            return 0;
        }
        return parseFloat(((a / b) * 100).toFixed(2));
    };
    return (
        <div className="grid grid-cols-4 gap-2 h-fit py-4">
            {trxByWarehouse.map((tx) => (
                <div key={tx.warehouse_id} className="flex flex-col justify-between text-sm px-4 py-2 dark:bg-slate-500 bg-yellow-200 rounded-xl">
                    <h1 className="font-semibold text-nowrap overflow-hidden">{tx.warehouse_name}</h1>
                    <h1 className="font-semibold text-lg">{calculatePercentage(tx.confirmed_count, tx.total)}%</h1>
                </div>
            ))}
        </div>
    );
};

export default PercentageCount;
