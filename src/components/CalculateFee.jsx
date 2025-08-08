const calculateFee = (amount, chunkSize = 2500000, feePerChunk = 5000) => {
    if (amount < 100000) {
        return 3000;
    }

    const chunkCount = Math.ceil(amount / chunkSize);
    return chunkCount * feePerChunk;
};

export default calculateFee;
