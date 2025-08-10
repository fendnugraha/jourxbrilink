import { ArrowDownIcon, ArrowUpIcon, HandCoinsIcon, ShoppingBagIcon } from "lucide-react";
import MainPage from "../main";
import TransactionContent from "./components/TransactionContent";

export const metadata = {
    title: "Jour x BRILink - Transaction",
    description: "Journal Apps for AgenBRI Link",
};
const TransactionPage = () => {
    return (
        <>
            <MainPage headerTitle="Transaction">
                <TransactionContent />
            </MainPage>
        </>
    );
};

export default TransactionPage;
