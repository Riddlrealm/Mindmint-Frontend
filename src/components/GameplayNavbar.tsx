import { useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { AuthService } from "../services/AuthService";


const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuId = useId();
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate("/sign-in");
  };


  // Scroll anchors remain separate (they're not routes)
  const scrollMenu = [
    { name: "How to Play", link: "#how-to-play" },
    { name: "About", link: "#about" },
    { name: "Contributors", link: "#contributors" },
    { name: "FAQs", link: "#faqs" },
  ];

  return (
    <nav className="relative " aria-label="Primary">
      <div className=" px-5 md:px-10 py-5 w-full">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="shrink-0 flex items-center gap-2.5 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#01100F]"
          >
            <img src="/logo.svg" alt="" className="object-contain" />
            <h1 className="font-prompt font-bold text-[#CFFDED] text-[31px]">
              <span className="sr-only">LogiQuest home</span>
              <span aria-hidden="true">LogiQuest</span>
            </h1>
          </Link>

          <div className="hidden xl:flex items-center ">
            <div className="flex justify-center text-base items-center gap-4">
              {scrollMenu.map((item) => (
                <ScrollLink
                  key={item.link}
                  to={item.link.substring(1)}
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={500}
                  activeClass="text-white"
                  className="cursor-pointer hover:text-white hover:transition-colors text-[#F9BC07]"
                >
                  {item.name}
                </ScrollLink>
              ))}

              {/* Game-specific items */}
              <Link
                to="/store"
                className="flex items-center gap-2 rounded-sm px-2 py-1 text-[#F9BC07] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#01100F]"
                aria-label="Open store"
                title="Open store"
              >
                <p>Coins</p>
                <img src="/coins.svg" alt="Store coins" className="h-6 w-auto" />
              </Link>
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="Call a friend unavailable"
                title="Call a friend — unavailable outside gameplay"
              >
                <p>Call a friend</p>
                <img src="/call.svg" alt="Call a friend icon" className="h-6 w-auto" />
              </button>
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="50:50 unavailable"
                title="50:50 — unavailable outside gameplay"
              >
                <p>50:50</p>
                <img src="/fiftyfifty.svg" alt="50:50 icon" className="h-6 w-auto" />
              </button>
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="Audience unavailable"
                title="Audience — unavailable outside gameplay"
              >
                <p>Audience</p>
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
              <Link
                to="/settings"
                className="ml-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#01100F]"
                aria-label="Account settings"
                title="Account settings"
              >
                <img src="/manfists.png" alt="Account settings" className="w-11 h-11 ml-2 object-cover" />
              </Link>
            </div>
          </div>

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

      {isOpen ? (
        <div
          id={mobileMenuId}
          className="xl:hidden bg-[#323336] w-full px-10 pb-10 flex flex-col gap-6 absolute top-full left-0 z-50 border-t border-gray-800 shadow-2xl"
          role="presentation"
        >
          <div className="flex flex-col text-base gap-6 pt-5">
            {scrollMenu.map((item) => (
              <ScrollLink
                onClick={() => setIsOpen(false)}
                key={item.link}
                to={item.link.substring(1)}
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                activeClass="text-white"
                className="cursor-pointer hover:text-white hover:transition-colors text-[#F9BC07]"
              >
                {item.name}
              </ScrollLink>
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
                <img src="/coins.png" className="h-6 w-auto" alt="Store coins" />
              </Link>
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="Call a friend unavailable"
                title="Call a friend — unavailable outside gameplay"
              >
                <p>Call</p>
                <img src="/call.png" className="h-6 w-auto" alt="Call a friend icon" />
              </button>
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="50:50 unavailable"
                title="50:50 — unavailable outside gameplay"
              >
                <p>50:50</p>
                <img src="/5050.png" className="h-6 w-auto" alt="50:50 icon" />
              </button>
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-sm px-2 py-1 border border-white/10 bg-white/5 text-[#9CA3AF] opacity-60 cursor-not-allowed"
                aria-label="Audience unavailable"
                title="Audience — unavailable outside gameplay"
              >
                <p>Audience</p>
                <img src="/audience.png" className="h-6 w-auto" alt="Audience icon" />
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
                <img src="/bell.png" className="h-8 w-auto" alt="Notifications" />
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
                <img src="/logout.png" className="h-8 w-auto" alt="Log out" />
              </button>
              <Link
                to="/settings"
                onClick={() => setIsOpen(false)}
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9BC07] focus-visible:ring-offset-2 focus-visible:ring-offset-[#323336]"
                aria-label="Account settings"
                title="Account settings"
              >
                <img
                  src="/manfists.png"
                  className="w-10 h-10 object-cover rounded-full border border-[#F9BC07]"
                  alt="Account settings"
                />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default NavBar;
