import { ArrowDownIcon, ArrowUpIcon, HandCoinsIcon, ShoppingBagIcon } from "lucide-react";
import MainPage from "../main";
import TransactionContent from "./components/TransactionContent";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
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
