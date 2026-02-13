import { Link, useLocation } from "react-router-dom";
import { FiHome, FiArrowLeft, FiSearch } from "react-icons/fi";

export default function NotFound404() {
  const location = useLocation();

  return (
    <main className="min-h-[70vh] w-full bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-sm text-black/70">
          <FiSearch className="text-black/60" />
          <span>Rota não encontrada</span>
        </div>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-black md:text-6xl">
          404
        </h1>

        <p className="mt-3 max-w-xl text-base text-black/70 md:text-lg">
          A página que você tentou acessar não existe ou foi movida.
        </p>

        <div className="mt-4 w-full max-w-xl rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-left text-sm text-black/70">
          <div className="text-xs font-medium uppercase text-black/50">
            Caminho solicitado
          </div>
          <div className="mt-1 break-all font-mono">{location.pathname}</div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/90"
          >
            <FiHome />
            Ir para Home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black hover:bg-black/[0.03]"
          >
            <FiArrowLeft />
            Voltar
          </button>
        </div>

        <p className="mt-10 text-xs text-black/50">
          Se você acha que isso é um erro, volte para a Home e tente novamente.
        </p>
      </div>
    </main>
  );
}
