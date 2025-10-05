const PercentageCount = ({ trxByWarehouse }) => {
    const calculatePercentage = (a, b) => {
        if (b === 0) {
            return 0;
        }
        return parseFloat(((a / b) * 100).toFixed(2));
    };
    return (
        <div className="grid grid-cols-2 gap-2 h-fit">
            {trxByWarehouse.data?.map((tx) => (
                <div key={tx.warehouse_id} className="flex flex-col justify-between text-sm px-4 py-2 card h-16">
                    <h1 className="font-semibold">{tx.warehouse_code}</h1>
                    <h1 className="font-semibold text-lg">{calculatePercentage(tx.confirmed_count, tx.total)}%</h1>
                </div>
            ))}
        </div>
    );
};

export default PercentageCount;
