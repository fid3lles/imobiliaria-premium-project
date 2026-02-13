import { useEffect, useState } from "react";
import FiltersPanel from "../components/Results/FiltersPanel/FiltersPanel";
import PropertyResultsGrid from "../components/Results/PropertyList/PropertyResultGrid";

function Search() {
  const [searchResult, setSearchResult] = useState<any>(null);

  // ✅ página atual (0-based) — vem do backend em searchResult.number
  const [page, setPage] = useState(0);

  // ✅ modal de filtros (mobile)
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ✅ recebe o retorno da busca e sincroniza a página
  function handleResult(data: any) {
    setSearchResult(data);
    setPage(data?.number ?? 0);
  }

  // ✅ trava scroll do body quando modal estiver aberto (somente mobile)
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    if (filtersOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [filtersOpen]);

  return (
    <div className="flex min-h-screen">
      {/* ✅ Sidebar no desktop / Modal no mobile (mesmo componente, SEM desmontar) */}
      <div className="hidden md:block">
        <FiltersPanel onResult={handleResult} externalPage={page} />
      </div>

      {/* ✅ Modal mobile (mantém montado para não perder estado/seleções) */}
      <div
        className={[
          "md:hidden fixed inset-0 z-50",
          "transition-all duration-200",
          filtersOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!filtersOpen}
      >
        {/* backdrop */}
        <div
          className={[
            "absolute inset-0 bg-black/40 transition-opacity duration-200",
            filtersOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setFiltersOpen(false)}
        />

        {/* painel (sheet) */}
        <div
          className={[
            "absolute inset-y-0 left-0 w-[92%] max-w-[420px]",
            "bg-white shadow-2xl",
            "transition-transform duration-200",
            filtersOpen ? "translate-x-0" : "-translate-x-full",
            "flex flex-col",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
        >
          {/* header do modal */}
          <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
            <div className="font-extrabold text-zinc-900">Filtros</div>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="h-10 px-3 rounded-lg border border-zinc-200 text-sm font-extrabold text-zinc-700 hover:bg-zinc-50"
            >
              Fechar
            </button>
          </div>

          {/* conteúdo rolável */}
          <div className="p-3 overflow-auto">
            <FiltersPanel
              onResult={(data) => {
                handleResult(data);
                // ✅ após buscar no mobile, fecha modal para ver resultados
                setFiltersOpen(false);
              }}
              externalPage={page}
            />
          </div>
        </div>
      </div>

      <section className="px-4 md:px-6 py-6 md:py-8 w-full">
        {/* ✅ header mobile com botão de abrir filtros */}
        <div className="md:hidden mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold text-zinc-900">
            Resultados da busca
          </h1>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="h-10 px-4 rounded-lg bg-zinc-900 text-white text-sm font-extrabold"
          >
            Filtros
          </button>
        </div>

        {/* ✅ header desktop */}
        <h1 className="hidden md:block text-2xl font-bold mb-6 text-zinc-900">
          Resultados da busca
        </h1>

        <PropertyResultsGrid
          data={
            searchResult ?? {
              content: [],
              empty: true,
              first: true,
              last: true,
              number: 0,
              numberOfElements: 0,
              size: 0,
              totalElements: 0,
              totalPages: 0,
            }
          }
          onCardClick={(imovel) => console.log("clicou", imovel.id)}
          // ✅ paginação dispara troca de página
          onPageChange={(nextPage) => {
            if (nextPage < 0) return;
            if (
              searchResult?.totalPages != null &&
              nextPage > searchResult.totalPages - 1
            )
              return;

            setPage(nextPage);
            // fetch acontece dentro do FiltersPanel via externalPage effect
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </section>
    </div>
  );
}

export default Search;
