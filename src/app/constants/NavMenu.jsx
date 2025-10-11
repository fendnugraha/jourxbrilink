import {
    LayoutDashboardIcon,
    ArrowLeftRightIcon,
    ScaleIcon,
    DollarSignIcon,
    ChartAreaIcon,
    CogIcon,
    BoxesIcon,
    CoinsIcon,
    StoreIcon,
    LandmarkIcon,
    Truck,
} from "lucide-react";

export const navMenu = {
    mainMenu: [
        { name: "Dashboard", path: "/dashboard", href: "/dashboard", icon: LayoutDashboardIcon, role: ["Administrator", "Super Admin", "Kasir", "Staff"] },
        { name: "Transaction", path: "/transaction", href: "/transaction", icon: ArrowLeftRightIcon, role: ["Administrator", "Super Admin", "Kasir", "Staff"] },
        { name: "Store", path: "/store", href: "/store", icon: StoreIcon, role: ["Administrator", "Super Admin", "Kasir", "Staff"] },
        { name: "Finance", path: "/finance", href: "/finance", icon: DollarSignIcon, role: ["Administrator", "Super Admin"] },
        { name: "Delivery", path: "/delivery", href: "/delivery", icon: Truck, role: ["Administrator", "Super Admin", "Courier"] },
        { name: "Summary", path: "/summary", href: "/summary", icon: ChartAreaIcon, role: ["Administrator", "Super Admin"] },
        { name: "Settings", path: "/setting", href: "/setting", icon: CogIcon, role: ["Administrator", "Super Admin"] },
    ],
    settings: [{ name: "Settings", path: "/setting", href: "/setting", icon: CogIcon, role: ["Administrator", "Super Admin"] }],
};
