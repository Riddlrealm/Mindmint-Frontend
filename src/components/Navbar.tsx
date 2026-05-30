import { useState, useId } from "react";
import { Menu, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import { getNavItems } from "../config/routes";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuId = useId();
  const navItems = getNavItems("main");
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate("/sign-in");
  };

  return (
    <nav className="relative" aria-label="Primary">
      <div className="px-5 md:px-10 py-5 w-full">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="shrink-0 flex items-center gap-3 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#01100F]"
          >
            <img
              src="/logo.svg"
              alt=""
              className="h-16 w-auto object-contain"
            />
            <span className="font-prompt font-bold text-[#CFFDED] text-[31px]">
              <span className="sr-only">LogiQuest home</span>
              <span aria-hidden="true">
                <span>Logi</span>
                <span>Quest</span>
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center">
            <div className="flex justify-center text-base text-[#F9BC07] items-center gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "text-white font-bold"
                      : "cursor-pointer hover:text-white transition-colors"
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <Link
                to="/store"
                className="flex items-center gap-2 rounded-sm px-2 py-1 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#01100F]"
                aria-label="Open store"
                title="Open store"
              >
                <span>Coins</span>
                <img src="/coins.svg" alt="Store coins" className="h-6 w-auto" />
              </Link>

              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="Call a friend — unavailable outside gameplay"
                title="Call a friend — unavailable outside gameplay"
              >
                <span>Call a friend</span>
                <img src="/call.svg" alt="Call a friend icon" className="h-6 w-auto" />
              </button>

              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="50:50 lifeline unavailable outside gameplay"
                title="50:50 — unavailable outside gameplay"
              >
                <span>50:50</span>
                <img src="/fiftyfifty.svg" alt="50:50 icon" className="h-6 w-auto" />
              </button>

              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="Audience lifeline unavailable outside gameplay"
                title="Audience — unavailable outside gameplay"
              >
                <span>Audience</span>
                <img src="/audience.svg" alt="Audience icon" className="h-6 w-auto" />
              </button>

              <button
                type="button"
                disabled
                className="p-0 mx-2 border-0 bg-transparent opacity-50 cursor-not-allowed rounded-sm"
                aria-label="Notifications unavailable"
                title="Notifications unavailable"
              >
                <img src="/bell.svg" alt="Notifications" className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="p-0 border-0 bg-transparent cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#01100F]"
                aria-label="Log out"
                title="Log out"
              >
                <img src="/logout.svg" alt="Log out" className="h-7" />
              </button>
              <NavLink
                to="/settings"
                aria-label="Account settings"
                title="Account settings"
                className="ml-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#01100F]"
              >
                <img
                  src="/manfists.png"
                  alt="Account settings"
                  className="w-11 h-11 object-cover"
                />
              </NavLink>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="xl:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#F9BC07] rounded-sm p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#01100F]"
              aria-expanded={isOpen}
              aria-controls={mobileMenuId}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={32} aria-hidden /> : <Menu size={32} aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <div
          id={mobileMenuId}
          className="xl:hidden bg-[#323336] w-full px-10 pb-10 flex flex-col gap-6 absolute top-full left-0 z-50 border-t border-gray-800 shadow-2xl"
          role="presentation"
        >
          <div className="flex flex-col text-base text-[#F9BC07] gap-6 pt-5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  isActive ? "text-white font-bold" : ""
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="flex flex-col gap-6">
              <Link
                to="/store"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-sm px-2 py-1 text-[#F9BC07] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#323336]"
                aria-label="Open store"
                title="Open store"
              >
                <p>Coins</p>
                <img src="/coins.svg" className="h-6 w-auto" alt="Store coins" />
              </Link>
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="Call a friend unavailable"
                title="Call a friend — unavailable outside gameplay"
              >
                <p>Call</p>
                <img src="/call.svg" className="h-6 w-auto" alt="Call a friend icon" />
              </button>
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="50:50 unavailable"
                title="50:50 — unavailable outside gameplay"
              >
                <p>50:50</p>
                <img src="/fiftyfifty.svg" className="h-6 w-auto" alt="50:50 icon" />
              </button>
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="Audience unavailable"
                title="Audience — unavailable outside gameplay"
              >
                <p>Audience</p>
                <img src="/audience.svg" className="h-6 w-auto" alt="Audience icon" />
              </button>
            </div>

            <div className="flex items-center gap-6 mt-2">
              <button
                type="button"
                disabled
                className="p-0 border-0 bg-transparent opacity-50 cursor-not-allowed rounded-sm"
                aria-label="Notifications unavailable"
                title="Notifications unavailable"
              >
                <img src="/bell.svg" className="h-8 w-auto" alt="Notifications" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="p-0 border-0 bg-transparent cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#323336]"
                aria-label="Log out"
                title="Log out"
              >
                <img src="/logout.svg" className="h-8 w-auto" alt="Log out" />
              </button>
              <NavLink
                to="/settings"
                onClick={() => setIsOpen(false)}
                aria-label="Account settings"
                title="Account settings"
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#323336]"
              >
                <img
                  src="/manfists.png"
                  className="w-10 h-10 object-cover rounded-full border border-[#F9BC07]"
                  alt="Account settings"
                />
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;