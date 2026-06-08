import { BadgeCheck, CheckCircleIcon, CircleAlertIcon, InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";

const Notification = ({ type = "success", notification, title, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Muncul dengan animasi
        setVisible(true);

        const timer = setTimeout(() => {
            // Mulai animasi keluar
            setVisible(false);

            // Tunggu animasi selesai baru panggil onClose
            setTimeout(() => {
                onClose();
            }, 300); // Durasi animasi harus sama dengan transition duration
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    let notificationTitle = "";
    let notificationIcon = null;

    switch (type) {
        case "success":
            notificationTitle = "Success";
            notificationIcon = <BadgeCheck size={30} fill="yellow" className="text-green-500" />;
            break;
        case "error":
            notificationTitle = "Error";
            notificationIcon = <CircleAlertIcon size={30} fill="red" className="text-red-300" />;
            break;
        default:
            notificationTitle = "Info";
            notificationIcon = <InfoIcon size={30} fill="white" className="text-teal-500" />;
    }

    return (
        <div
            className={`fixed top-4 sm:top-6 left-0 right-0 sm:right-10 sm:left-auto sm:w-96 z-100000 flex justify-center sm:justify-end transition-all duration-500 ease-in-out ${
                visible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
            }`}
        >
            <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm drop-shadow-2xl border border-slate-500/50 rounded-3xl py-2 ps-2 p-4 flex items-start gap-2 w-[90%] sm:w-auto">
                <span className="flex items-center justify-center">{notificationIcon}</span>
                <p className="text-xs">
                    <span className="text-sm font-bold block">{title || notificationTitle}</span>
                    {notification}
                </p>
            </div>
        </div>
    );
};

export default Notification;
