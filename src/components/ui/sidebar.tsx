import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Settings,
  LogOut,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TerminalSquare
} from "lucide-react";
import { Button } from "./button";
import Logo from "./logo";
import { useUserStore } from "@/stores/user.store";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isOpen, onToggle, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const { userInfo, logout } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    {
      name: "Funcionários",
      href: "/employees",
      icon: Users,
      current: location.pathname === "/employees"
    },
    {
      name: "Terminal",
      href: "/terminal",
      icon: TerminalSquare,
      current: location.pathname === "/terminal"
    },
    {
      name: "Configurações",
      href: "/settings",
      icon: Settings,
      current: location.pathname === "/settings"
    }
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center border-b border-slate-200 dark:border-slate-700 ${isCollapsed ? 'justify-center p-4' : 'justify-between p-6'}`}>
            {!isCollapsed && <Logo size="sm" />}
            <div className="flex items-center gap-2">
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* User Info */}
          <div className={`border-b border-slate-200 dark:border-slate-700 ${isCollapsed ? 'p-4' : 'p-6'}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className={`bg-green-500 rounded-full flex items-center justify-center ${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'}`}>
                <span className={`text-white font-medium ${isCollapsed ? 'text-xs' : 'text-sm'}`}>
                  {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {userInfo?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {userInfo?.email || 'email@exemplo.com'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 space-y-2 ${isCollapsed ? 'px-2 py-6' : 'px-4 py-6'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center text-sm font-medium rounded-lg transition-colors
                    ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'}
                    ${item.current
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`${isCollapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'}`} />
                  {!isCollapsed && item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`border-t border-slate-200 dark:border-slate-700 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full text-slate-700 hover:bg-red-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-red-900/20 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed ${isCollapsed ? 'justify-center px-2 py-3' : 'justify-start px-3 py-2'}`}
              title={isCollapsed ? (isLoggingOut ? "Saindo..." : "Sair") : undefined}
            >
              {isLoggingOut ? (
                <Loader2 className={`h-5 w-5 animate-spin ${isCollapsed ? '' : 'mr-3'}`} />
              ) : (
                <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
              )}
              {!isCollapsed && (isLoggingOut ? "Saindo..." : "Sair")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
