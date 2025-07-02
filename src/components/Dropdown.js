"use client";

import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

export default function Dropdown({ align = "right", width = 48, contentClasses = "py-1 bg-white", trigger, children }) {
    // Handle width (Tailwind)
    let widthClass = "";
    switch (width) {
        case 48:
        case "48":
            widthClass = "w-48";
            break;
        default:
            widthClass = "";
            break;
    }

    // Handle alignment
    let alignmentClasses = "";
    switch (align) {
        case "left":
            alignmentClasses = "origin-top-left left-0";
            break;
        case "top":
            alignmentClasses = "origin-top";
            break;
        case "right":
        default:
            alignmentClasses = "origin-top-right right-0";
            break;
    }

    return (
        <Menu as="div" className="relative inline-block text-left">
            {({ open }) => (
                <>
                    <Menu.Button as={Fragment}>{trigger}</Menu.Button>

                    <Transition
                        show={open}
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items
                            static
                            className={`absolute z-[999] mt-2 rounded-md shadow-lg ${alignmentClasses} ${contentClasses} border border-gray-300`}
                        >
                            {children}
                        </Menu.Items>
                    </Transition>
                </>
            )}
        </Menu>
    );
}
