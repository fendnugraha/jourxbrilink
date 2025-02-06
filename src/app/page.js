import LoginLinks from "./LoginLinks";

export default function Home() {
    return (
        <div className="flex h-screen justify-center items-center flex-col p-4">
            <h1 className="text-7xl text-blue-800 font-bold mb-4">
                THREE <span className="text-orange-600 font-normal">KOMUNIKA</span>
            </h1>
            <LoginLinks />
        </div>
    );
}
