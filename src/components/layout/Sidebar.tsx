
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  AlertTriangle,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Gavel,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
}

export function Sidebar({ isOpen, isMobile }: SidebarProps) {
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);

  const navItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      description: "Overview of inventory metrics",
    },
    {
      name: "Inventory",
      icon: Package,
      path: "/inventory",
      description: "Manage products and stock",
    },
    {
      name: "Forecasting",
      icon: TrendingUp,
      path: "/forecasting",
      description: "AI-powered demand prediction",
    },
    {
      name: "Suppliers",
      icon: Users,
      path: "/suppliers",
      description: "Manage and evaluate suppliers",
    },
    {
      name: "Bidding",
      icon: Gavel,
      path: "/bidding",
      description: "Automated supplier bidding",
    },
    {
      name: "Maintenance",
      icon: Wrench,
      path: "/maintenance",
      description: "Predictive equipment maintenance",
    },
    {
      name: "Expiry Tracking",
      icon: AlertTriangle,
      path: "/expiry",
      description: "Monitor product expiration",
    },
    {
      name: "Reports",
      icon: FileText,
      path: "/reports",
      description: "Generate inventory reports",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
      description: "Configure system preferences",
    },
  ];

  const sidebarClasses = cn(
    "h-full bg-sidebar border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col z-30",
    isOpen ? "w-64" : "w-20",
    isMobile && isOpen ? "fixed inset-y-0 left-0 shadow-lg" : "",
    isMobile && !isOpen ? "hidden" : ""
  );

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          {isOpen && (
            <span className="font-bold text-xl text-primary animate-fade-in cursor-pointer">MedInventory</span>
          )}
          {!isOpen && <span className="font-bold text-xl text-primary cursor-pointer">M</span>}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.name} 
                onMouseEnter={() => setHoveredNavItem(item.name)} 
                onMouseLeave={() => setHoveredNavItem(null)}
                className="relative">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center p-3 rounded-md transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    !isOpen && "justify-center"
                  )
                }
              >
                <item.icon size={20} className={cn(isOpen ? "mr-3" : "mx-auto")} />
                {isOpen && <span>{item.name}</span>}
              </NavLink>
              
              {/* Tooltip for collapsed sidebar */}
              {!isOpen && hoveredNavItem === item.name && (
                <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap z-50 animate-fade-in">
                  {item.name}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="flex items-center w-full p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
          <LogOut size={20} className={cn(isOpen ? "mr-3" : "mx-auto")} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
