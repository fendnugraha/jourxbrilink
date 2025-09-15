import { LayoutDashboardIcon, ArrowLeftRightIcon, ScaleIcon, DollarSignIcon, ChartAreaIcon, CogIcon, BoxesIcon, CoinsIcon, StoreIcon } from "lucide-react";

export const navMenu = {
    mainMenu: [
        { name: "Dashboard", path: "/dashboard", href: "/dashboard", icon: LayoutDashboardIcon, role: ["Administrator", "Kasir", "Staff"] },
        { name: "Transaction", path: "/transaction", href: "/transaction", icon: ArrowLeftRightIcon, role: ["Administrator", "Kasir", "Staff"] },
        { name: "Store", path: "/store", href: "/store", icon: StoreIcon, role: ["Administrator", "Kasir", "Staff"] },
        { name: "Finance", path: "/finance", href: "/finance", icon: DollarSignIcon, role: ["Administrator"] },
        { name: "Summary", path: "/summary", href: "/summary", icon: ChartAreaIcon, role: ["Administrator"] },
        { name: "Settings", path: "/setting", href: "/setting", icon: CogIcon, role: ["Administrator"] },
    ],
    settings: [{ name: "Settings", path: "/setting", href: "/setting", icon: CogIcon, role: ["Administrator"] }],
};
