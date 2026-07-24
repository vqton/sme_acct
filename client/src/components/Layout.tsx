import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  FileText,
  Calculator,
  BarChart3,
  CalendarDays,
  Users,
  UserCog,
  Landmark,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Receipt,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string }[];
}

const navGroups: NavItem[] = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Công ty",
    icon: Building2,
    children: [
      { label: "Danh sách công ty", path: "/companies" },
      { label: "Tạo công ty mới", path: "/companies/new" },
    ],
  },
  {
    label: "Kế toán",
    icon: BookOpen,
    children: [
      { label: "Chart of Accounts", path: "/accounting/accounts" },
      { label: "Bút toán", path: "/accounting/journal-entries" },
      { label: "Sổ cái", path: "/accounting/ledger" },
      { label: "Bảng cân đối TK", path: "/accounting/trial-balance" },
      { label: "Báo cáo tài chính", path: "/accounting/reports" },
      { label: "Kết kỳ", path: "/accounting/period-close" },
      { label: "Số dư đầu kỳ", path: "/accounting/opening-balance" },
    ],
  },
  {
    label: "Thuế",
    icon: Receipt,
    children: [
      { label: "Khai thuế", path: "/accounting/tax" },
      { label: "Lịch thuế", path: "/accounting/tax/calendar" },
      { label: "Kỳ thuế", path: "/accounting/tax/periods" },
    ],
  },
  {
    label: "Người dùng",
    icon: Users,
    children: [
      { label: "Danh sách", path: "/users" },
      { label: "Nhóm quyền", path: "/user-groups" },
    ],
  },
  {
    label: "Phiên đăng nhập",
    icon: Clock,
    path: "/sessions",
  },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Kế toán", "Thuế", "Người dùng"]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-4">
          {sidebarOpen ? (
            <span className="text-lg font-bold text-sidebar-primary">SME Accounting</span>
          ) : (
            <span className="text-lg font-bold text-sidebar-primary mx-auto">S</span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {navGroups.map((group) => (
              <div key={group.label}>
                {group.children ? (
                  <>
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        expandedGroups.includes(group.label) && "bg-sidebar-accent"
                      )}
                    >
                      <group.icon className="h-4 w-4 shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left">{group.label}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedGroups.includes(group.label) && "rotate-180"
                            )}
                          />
                        </>
                      )}
                    </button>
                    {sidebarOpen && expandedGroups.includes(group.label) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {group.children.map((child) => (
                          <button
                            key={child.path}
                            onClick={() => navigate(child.path)}
                            className={cn(
                              "flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              isActive(child.path) &&
                                "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            )}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => group.path && navigate(group.path)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive(group.path!) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <group.icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span>{group.label}</span>}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User section */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.username}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline">{user?.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/sessions")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Phiên đăng nhập
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
