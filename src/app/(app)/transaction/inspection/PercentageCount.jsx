const PercentageCount = ({ trxByWarehouse }) => {
    const calculatePercentage = (a, b) => {
        if (b === 0) {
            return 0;
        }
        return Math.round((a / b) * 100);
    };
    return (
        <div className="">
            {trxByWarehouse.data?.map((tx) => (
                <div key={tx.warehouse_id} className="flex justify-between text-sm px-4 py-2 mb-1 card">
                    <h1 className="font-semibold">{tx.warehouse_name}</h1>
                    <h1>{calculatePercentage(tx.confirmed_count, tx.total)}%</h1>
                </div>
            ))}
        </div>
    );
};

export default PercentageCount;
