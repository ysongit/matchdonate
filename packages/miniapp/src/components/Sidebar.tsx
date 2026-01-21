import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownLeftIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EyeIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  currentPage: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const router = useNavigate();

  const menuItems: MenuItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <EyeIcon className="w-5 h-5" />,
    },
    {
      id: "mygivingfund",
      label: "My Giving Fund",
      icon: <UserIcon className="w-5 h-5" />,
    },
    {
      id: "my-community",
      label: "My Community",
      icon: <UserGroupIcon className="w-5 h-5" />,
    },
    {
      id: "gifting",
      label: "Gifting",
      icon: <CreditCardIcon className="w-5 h-5" />,
    },
    {
      id: "donation",
      label: "Donation",
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
    },
    {
      id: "payments",
      label: "Payments",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      badge: 9,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: <ArrowPathIcon className="w-5 h-5" />,
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: <ChartBarIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-72 bg-white h-screen shadow-lg p-4">
      <nav className="space-y-2">
        {menuItems.map(item => {
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              className={`
                w-full flex items-center gap-3 px-5 py-3.5 rounded-full
                transition-all duration-200 text-left group relative
                ${
                  isActive
                    ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md"
                    : "text-gray-400 hover:bg-purple-50 hover:text-purple-500"
                }
              `}
              onClick={() => router(`/${item.id}`)}
            >
              <span className={isActive ? "text-white" : "text-purple-400 group-hover:text-purple-500"}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Logout button */}
        <button
          className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full
            text-gray-400 hover:bg-purple-50 hover:text-purple-500
            transition-all duration-200 text-left group mt-6"
        >
          <span className="text-purple-400 group-hover:text-purple-500">
            <ArrowDownLeftIcon className="w-5 h-5" />
          </span>
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
