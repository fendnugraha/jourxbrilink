import Link from "next/link";

const NavLink = ({ active = false, children, isOpen, ...props }) => (
    <Link
        {...props}
        className={`flex items-center hover:bg-slate-200 hover:text-slate-700 ${
            active ? "bg-yellow-200 text-slate-700" : ""
        } rounded-2xl transition-all duration-200 origin-left ease-in`}
    >
        {children}
    </Link>
);

export default NavLink;
