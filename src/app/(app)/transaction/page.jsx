import { ArrowDownIcon, ArrowUpIcon, HandCoinsIcon, ShoppingBagIcon } from "lucide-react";
import MainPage from "../main";
import TransactionContent from "./components/TransactionContent";

const getCurrentDate = () => {
    const nowUTC = new Date();
    const jakartaOffset = 7 * 60; // WIB = UTC+7 (dalam menit)
    const local = new Date(nowUTC.getTime() + jakartaOffset * 60 * 1000);

    const year = local.getUTCFullYear();
    const month = String(local.getUTCMonth() + 1).padStart(2, "0");
    const day = String(local.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const metadata = {
    title: "Jour x BRILink - Transaction",
    description: "Journal Apps for AgenBRI Link",
};
const TransactionPage = () => {
    return (
        <>
            <MainPage headerTitle="Transaction">
                <TransactionContent currentDate={getCurrentDate()} />
            </MainPage>
        </>
    );
};

export default TransactionPage;
