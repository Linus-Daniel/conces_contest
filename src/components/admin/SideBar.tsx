"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  UsersIcon,
  ChartBarIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Settings } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { link: "/admin", name: "Dashboard", icon: Home },
  { link: "/admin/contestants", name: "User Management", icon: UsersIcon },
  { link: "/admin/votes", name: "Vote Management", icon: ChartBarIcon },
  { link: "/admin/submissions", name: "submissions", icon: TrophyIcon },
  { link: "/admin/maintenance", name: "Maintenance", icon: Settings },
];

export default function Sidebar({
  isOpen,
  onClose,

}: SidebarProps) {

  const pathname = usePathname();
  console.log(pathname)
  

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((nav) => (
          <Link
            href={nav.link}
            key={nav.link}
          
            className={clsx(
              "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === nav.link
                ? "bg-primary-100 text-primary-700 border-r-2 border-primary-500"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <nav.icon className="mr-3 w-5 h-5" />
            {nav.name}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
