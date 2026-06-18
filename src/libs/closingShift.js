import axios from "./axios";
import { DateTimeNow } from "./format";
import { sendTelegramAlert } from "./telegramAlert";

export const closingShift = async ({ cred_code, amount, message, warehouse }) => {
    const { today } = DateTimeNow();
    try {
        const payload = {
            date_issued: today,
            debt_code: 2,
            cred_code: cred_code,
            is_confirmed: true,
            amount: amount,
            fee_amount: 0,
            trx_type: "Mutasi Kas",
            description: "Setoran kas akhir shift",
        };

        const response = await axios.post("/api/create-mutation", payload);
        sendTelegramAlert({
            title: "💰 CLOSING SHIFT",
            source: warehouse,
            message: message,
        });

        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
