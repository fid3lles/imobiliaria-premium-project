import { useEffect, useId, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { NavLink } from "react-router-dom";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // ✅ fecha no ESC + trava scroll quando aberto
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkBase =
    "block w-full rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wide transition";
  const linkHover =
    "hover:bg-white/10 hover:drop-shadow-[0_0_6px_rgba(255,214,214,0.25)]";

  return (
    <header className="fixed top-0 left-0 w-full z-50 shadow bg-linear-to-r from-[#64080F] via-[#91040F] via-[#9A030F] to-[#C20010]">
      <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
        <a href="/" className="flex items-center h-full w-28">
          <img
            src="../../../../public/assets/logo_premium.png"
            alt="Premium imobiliária Logo"
            className="object-contain h-20"
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase text-[#FCE257] font-semibold">
          <NavLink
            to="/busca"
            className={() =>
              cn(
                "relative transition hover:drop-shadow-[0_0_6px_rgba(255,214,214,0.6)]",
                "after:absolute after:-bottom-2 after:left-0 after:w-full after:bg-[#FCE257]",
                "ac-none",
              )
            }
          >
            Comprar
          </NavLink>
          <NavLink
            to="/busca"
            className={() =>
              cn(
                "relative transition hover:drop-shadow-[0_0_6px_rgba(255,214,214,0.6)]",
                "after:absolute after:-bottom-2 after:left-0 after:w-full after:bg-[#FCE257]",
              )
            }
          >
            Alugar
          </NavLink>
          <NavLink
            to="/anunciar"
            className={() =>
              cn(
                "relative transition hover:drop-shadow-[0_0_6px_rgba(255,214,214,0.6)]",
                "after:absolute after:-bottom-2 after:left-0 after:w-full after:bg-[#FCE257]",
              )
            }
          >
            Anunciar meu imóvel
          </NavLink>
        </nav>

        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-[#FCE257] mr-2 rounded-xl p-2 transition hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-[#FCE257]/40"
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-expanded={open}
        >
          {!open ? <FiMenu size={28} /> : <RxCross2 size={28} />}
        </button>
      </div>

      {/* Mobile overlay + drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[60]",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        {/* Overlay */}
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
        />

        {/* Drawer */}
        <aside
          id={menuId}
          className={cn(
            "absolute right-0 top-0 h-full w-[86%] max-w-sm bg-[#64080F] shadow-2xl",
            "transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
          role="menu"
        >
          {/* Drawer header */}
          <div className="h-24 px-4 flex items-center justify-between border-b border-white/10">
            <div className="text-[#FCE257] font-extrabold tracking-wide uppercase text-sm">
              Menu
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[#FCE257] rounded-xl p-2 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#FCE257]/40"
              aria-label="Fechar menu"
            >
              <RxCross2 size={26} />
            </button>
          </div>

          {/* Links */}
          <div className="px-3 py-4 space-y-2 text-[#FCE257]">
            <NavLink
              to="/busca"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  linkBase,
                  isActive ? "bg-white/10" : "bg-transparent",
                  linkHover,
                )
              }
            >
              Comprar
            </NavLink>

            <NavLink
              to="/busca"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  linkBase,
                  isActive ? "bg-white/10" : "bg-transparent",
                  linkHover,
                )
              }
            >
              Alugar
            </NavLink>

            <NavLink
              to="/anunciar"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  linkBase,
                  isActive ? "bg-white/10" : "bg-transparent",
                  linkHover,
                )
              }
            >
              Anunciar meu imóvel
            </NavLink>

            {/* CTA opcional (mesmas cores) */}
            <div className="pt-2">
              <NavLink
                to="/busca"
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-xl bg-[#C20010] px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow hover:brightness-110 transition"
              >
                Buscar imóveis
              </NavLink>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
