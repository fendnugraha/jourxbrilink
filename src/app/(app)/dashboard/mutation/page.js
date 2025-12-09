import MainPage from "../../main";
import BalanceMutation from "../components/BalanceMutation";

const MutationPage = () => {
    return (
        <MainPage headerTitle="Mutation">
            <div className="py-4 sm:py-8 px-4 sm:px-12 overflow-x-auto">
                <BalanceMutation />
            </div>
        </MainPage>
    );
};

export default MutationPage;
