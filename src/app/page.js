import Image from "next/image";
import LoginLinks from "./LoginLinks";

export default function Home() {
    return (
        <div
            className="min-h-screen flex flex-col justify-between bg-white text-gray-800"
            style={{
                backgroundImage: "url('/bg.jpg')",
                backgroundColor: "rgba(222 ,222 ,222 ,.5)",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
        >
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-2">
                    <Image src="/jour-logo.svg" alt="Jour Logo" width={30} height={14} priority /> {" | "}
                    <h1 className="text-2xl font-bold text-slate-500 ">THREEKOMUNIKA</h1>
                </div>
                <div>
                    <LoginLinks />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center px-4">
                <h1 className="text-sm">Journal Apps for</h1>
                <h1 className="text-blue-800 text-8xl font-bold">
                    AgenBRI
                    <span className="text-orange-500">Link</span>
                </h1>
            </main>

            {/* Footer */}
            <footer className="text-center py-4 text-sm text-gray-500">
                Created by <Image src="/eightnite.png" alt="Eightnite Logo" className="inline" width={75} height={14} priority />
            </footer>
        </div>
    );
}
