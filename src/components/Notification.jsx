import { CheckCircleIcon, CircleAlertIcon, InfoIcon } from "lucide-react";
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
            notificationIcon = <CheckCircleIcon size={42} className="text-green-500" />;
            break;
        case "error":
            notificationTitle = "Error !";
            notificationIcon = <CircleAlertIcon size={42} className="text-red-500" />;
            break;
        default:
            notificationTitle = "Info";
            notificationIcon = <InfoIcon size={42} className="text-teal-500" />;
    }

    return (
        <div
            className={`fixed top-4 sm:top-2 left-0 right-0 sm:right-2 sm:left-auto sm:w-96 z-[100000] flex justify-center sm:justify-end transition-all duration-300 ease-in-out ${
                visible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
            }`}
        >
            <div className="bg-white/70 dark:bg-slate-600/70 backdrop-blur-sm border border-slate-500/50 rounded-3xl py-2 px-3 drop-shadow-sm flex items-center gap-3 w-[90%] sm:w-auto">
                {notificationIcon}
                <div>
                    <p className="text-xs">
                        <span className="font-bold block">{title || notificationTitle}</span>
                        {notification}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Notification;
