import LoginLinks from "./LoginLinks";

export default function Home() {
    return (
        <div className="flex h-screen justify-center items-center flex-col">
            <h1 className="text-7xl text-blue-800 font-bold mb-4">
                THREE <span className="text-orange-600">KOMUNIKA</span>
            </h1>
            <LoginLinks />
        </div>
    );
}
