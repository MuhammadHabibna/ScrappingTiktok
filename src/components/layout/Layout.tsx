import { Outlet, Link, useLocation } from "react-router-dom"
import { Home, Settings, Radio, ChevronLeft, ChevronRight, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Layout() {
    return (
        <div className="flex min-h-screen bg-transparent text-foreground font-sans antialiased selection:bg-primary/20">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-auto transition-all duration-300 ease-in-out">
                <Outlet />
            </main>
        </div>
    )
}

function Sidebar() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const links = [
        { icon: Home, label: "Dashboard", to: "/" },
        { icon: Settings, label: "Configuration", to: "/settings" },
    ];

    return (
        <div
            className={cn(
                "border-r border-border bg-background/30 backdrop-blur-md flex flex-col gap-8 hidden md:flex sticky top-0 h-screen transition-all duration-300 ease-in-out relative group",
                collapsed ? "w-20 p-4" : "w-72 p-6"
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-10 h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </Button>

            <div className={cn("flex items-center gap-3 transition-all", collapsed ? "justify-center" : "px-2")}>
                <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/20 flex-shrink-0">
                    <Radio size={20} className="animate-pulse" />
                </div>
                {!collapsed && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="font-bold text-lg tracking-tight block whitespace-nowrap">TikData Lite</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-70">Professional</span>
                    </div>
                )}
            </div>

            <nav className="flex flex-col gap-2">
                {!collapsed && <p className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2 animate-in fade-in">Menu</p>}
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.to;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-inner"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                collapsed && "justify-center px-2"
                            )}
                            title={collapsed ? link.label : undefined}
                        >
                            <Icon size={18} />
                            {!collapsed && <span>{link.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto space-y-4">
                {/* API Limit Warning */}
                {!collapsed && (
                    <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/10 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 text-yellow-500 font-medium text-xs">
                            <CreditCard size={12} />
                            <span>API Limit Warning</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Apify usage is metered. Check your console to avoid interruption.
                        </p>
                    </div>
                )}

                {/* Status Widget */}
                <div className={cn(
                    "bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/10 text-xs transition-all",
                    collapsed ? "p-2 flex justify-center" : "p-5"
                )}>
                    {!collapsed ? (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-foreground">System Operational</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Ready to process TikTok data streams.
                            </p>
                        </>
                    ) : (
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" title="System Operational"></div>
                    )}
                </div>
            </div>
        </div>
    )
}
