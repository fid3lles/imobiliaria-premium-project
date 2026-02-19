import React, { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const TABS = [
  { key: "comprar", label: "Comprar" },
  { key: "alugar", label: "Alugar" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type Props = {
  tipos?: string[];
  cidades?: string[];
  bairros?: string[];
  onSearch?: (payload: any) => void;
  onSearchByCode?: (code: string) => void;
};

async function fetchStringList(url: string): Promise<string[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao buscar (${res.status})`);
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data) || !data.every((x) => typeof x === "string")) {
    throw new Error("Formato inválido (esperado: string[])");
  }
  return data;
}

function toModalidade(tab: TabKey) {
  return tab === "comprar" ? "COMPRA" : "ALUGUEL";
}

function buildSearchQueryParams(input: {
  tab: TabKey;
  tipo?: string;
  cidade?: string;
  bairro?: string;
  quartos?: string;
  valorMin?: string;
  valorMax?: string;
}) {
  const params = new URLSearchParams();

  const add = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;

    if (typeof value === "string") {
      const v = value.trim();
      if (!v) return;
      params.append(key, v);
      return;
    }

    if (typeof value === "number") {
      if (Number.isNaN(value)) return;
      params.append(key, String(value));
      return;
    }

    if (typeof value === "boolean") {
      params.append(key, String(value));
      return;
    }
  };

  add("modalidade", toModalidade(input.tab));
  add("tipo", input.tipo);
  add("cidade", input.cidade);
  add("bairro", input.bairro);

  if (input.quartos?.trim()) {
    const q = input.quartos.trim();
    const n = q === "4+" ? 4 : Number(q);
    if (!Number.isNaN(n)) add("qtdQuartos", n);
  }

  if (input.valorMin?.trim()) {
    const n = Number(input.valorMin.replace(/[^\d]/g, ""));
    if (!Number.isNaN(n) && n > 0) add("valorImovelMin", n);
  }
  if (input.valorMax?.trim()) {
    const n = Number(input.valorMax.replace(/[^\d]/g, ""));
    if (!Number.isNaN(n) && n > 0) add("valorImovelMax", n);
  }

  add("page", 0);

  return params;
}

export default function HomeSearch({
  tipos: tiposFallback = ["Apartamento", "Casa", "Sobrado", "Terreno"],
  cidades: cidadesFallback = ["Santo André", "São Bernardo", "Mauá"],
  bairros: bairrosFallback = ["Jardim", "Campestre", "Centro", "Vila Assunção"],
  onSearch,
  onSearchByCode,
}: Props) {
  const navigate = useNavigate();

  // ---------------------------
  // ✅ comportamento "FiltersPanel" (carrega opções do backend)
  // ---------------------------
  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/imobiliaria-core/api/v1`;

  const [tab, setTab] = useState<TabKey>("comprar");

  const [form, setForm] = useState({
    tipo: "",
    cidade: "",
    bairro: "",
    quartos: "",
    valorMin: "",
    valorMax: "",
    condominio: false,
    codigo: "",
  });

  const isCodeMode = useMemo(
    () => form.codigo.trim().length > 0,
    [form.codigo],
  );

  function handleChange(key: keyof typeof form, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = { tab, ...form };
    onSearch?.(payload);

    const params = buildSearchQueryParams({
      tab,
      tipo: form.tipo,
      cidade: form.cidade,
      bairro: form.bairro,
      quartos: form.quartos,
      valorMin: form.valorMin,
      valorMax: form.valorMax,
    });

    navigate(`/busca?${params.toString()}`);
  }

  function handleSubmitCode(e: React.FormEvent) {
    e.preventDefault();

    const code = form.codigo.trim();
    if (!code) return;

    onSearchByCode?.(code);

    navigate(`/imovel/${encodeURIComponent(code)}`);
  }

  const [cidades, setCidades] = useState<string[]>([]);
  const [cidadesLoading, setCidadesLoading] = useState(false);
  const [cidadesError, setCidadesError] = useState<string | null>(null);

  const [bairros, setBairros] = useState<string[]>([]);
  const [bairrosLoading, setBairrosLoading] = useState(false);
  const [bairrosError, setBairrosError] = useState<string | null>(null);

  const [tiposOptions, setTiposOptions] = useState<string[]>([]);
  const [tiposLoading, setTiposLoading] = useState(false);
  const [tiposError, setTiposError] = useState<string | null>(null);

  async function loadCidades() {
    setCidadesLoading(true);
    setCidadesError(null);
    try {
      const data = await fetchStringList(`${API_BASE}/categoria/cidades`);
      setCidades(data);
      setForm((prev) => ({
        ...prev,
        cidade: prev.cidade ?? "",
      }));
    } catch (err: any) {
      setCidades(cidadesFallback.filter((c) => c && c !== "Todas"));
      setCidadesError(err?.message ?? "Erro ao carregar cidades");
    } finally {
      setCidadesLoading(false);
    }
  }

  async function loadTiposImovel() {
    setTiposLoading(true);
    setTiposError(null);
    try {
      const data = await fetchStringList(`${API_BASE}/categoria/tipo-imovel`);
      setTiposOptions(data);
    } catch (err: any) {
      setTiposOptions(tiposFallback);
      setTiposError(err?.message ?? "Erro ao carregar tipos");
    } finally {
      setTiposLoading(false);
    }
  }

  async function loadBairros(cidade: string) {
    setBairrosLoading(true);
    setBairrosError(null);
    try {
      const url =
        `${API_BASE}/categoria/bairros?cidade=` + encodeURIComponent(cidade);
      const data = await fetchStringList(url);
      setBairros(data);
    } catch (err: any) {
      setBairros(bairrosFallback);
      setBairrosError(err?.message ?? "Erro ao carregar bairros");
    } finally {
      setBairrosLoading(false);
    }
  }

  useEffect(() => {
    loadCidades();
    loadTiposImovel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cidade = (form.cidade ?? "").trim();

    setForm((prev) => (prev.bairro ? { ...prev, bairro: "" } : prev));

    if (!cidade) {
      setBairros([]);
      setBairrosError(null);
      setBairrosLoading(false);
      return;
    }

    loadBairros(cidade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cidade]);

  const cidadesUI = useMemo(() => {
    const list = cidades.length > 0 ? cidades : cidadesFallback;

    const unique = Array.from(
      new Set(
        list
          .filter((c) => c && c.trim().length > 0)
          .map((c) => c.trim())
          .filter((c) => c.toLowerCase() !== "todas"), // ✅ remove "Todas" vindo do backend/fallback
      ),
    );

    return unique; // ✅ aqui NÃO inclui "Todas"
  }, [cidades, cidadesFallback]);

  const bairrosUI = useMemo(() => {
    const list = bairros.length > 0 ? bairros : [];
    const unique = Array.from(
      new Set(list.filter((b) => b && b.trim().length > 0)),
    );
    return unique;
  }, [bairros]);

  const tiposUI = useMemo(() => {
    const list = tiposOptions.length > 0 ? tiposOptions : tiposFallback;
    return Array.from(new Set(list.filter((t) => t && t.trim().length > 0)));
  }, [tiposOptions, tiposFallback]);

  return (
    <section className="w-full md:min-w-[50%]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 sm:px-5 border-b border-black/5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] font-extrabold tracking-wide text-black/80">
                  Encontre seu imóvel
                </div>
                <div className="text-[11px] text-black/50">
                  Pesquise por filtros ou vá direto pelo código.
                </div>
              </div>

              {/* Tabs (segmented) */}
              <div className="shrink-0">
                <div className="inline-flex rounded-xl bg-black/5 p-1">
                  {TABS.map((t) => {
                    const active = tab === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={[
                          "px-3 py-2 text-sm font-semibold rounded-lg transition",
                          "focus:outline-none focus:ring-2 focus:ring-[#C20010]/40",
                          active
                            ? "bg-[#64080F] text-white shadow"
                            : "text-black/70 hover:bg-black/10",
                        ].join(" ")}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              {/* Tipo */}
              <div className="md:col-span-4">
                <label
                  htmlFor="hs-tipo"
                  className="text-xs font-semibold text-black/70"
                >
                  Tipo
                </label>
                <select
                  id="hs-tipo"
                  value={form.tipo}
                  onChange={(e) => handleChange("tipo", e.target.value)}
                  disabled={tiposLoading || tiposUI.length === 0}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none
                             focus:ring-2 focus:ring-[#C20010]/40 disabled:bg-black/[0.03] disabled:text-black/40"
                >
                  <option value="">
                    {tiposLoading
                      ? "Carregando..."
                      : tiposUI.length === 0
                        ? "Sem opções"
                        : "Todos"}
                  </option>
                  {tiposUI.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {tiposError && (
                  <div className="mt-1.5 text-[11px] text-red-600 flex items-center justify-between gap-2">
                    <span className="truncate">{tiposError}</span>
                    <button
                      type="button"
                      onClick={loadTiposImovel}
                      className="underline font-semibold shrink-0"
                    >
                      Recarregar
                    </button>
                  </div>
                )}
              </div>

              {/* Cidade */}
              <div className="md:col-span-4">
                <label
                  htmlFor="hs-cidade"
                  className="text-xs font-semibold text-black/70"
                >
                  Cidade
                </label>
                <select
                  id="hs-cidade"
                  value={form.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                  disabled={cidadesLoading || cidadesUI.length === 0}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none
                             focus:ring-2 focus:ring-[#C20010]/40 disabled:bg-black/[0.03] disabled:text-black/40"
                >
                  <option value="">
                    {cidadesLoading
                      ? "Carregando..."
                      : cidadesUI.length === 0
                        ? "Sem opções"
                        : "Todas"}
                  </option>

                  {cidadesUI.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {cidadesError && (
                  <div className="mt-1.5 text-[11px] text-red-600 flex items-center justify-between gap-2">
                    <span className="truncate">{cidadesError}</span>
                    <button
                      type="button"
                      onClick={loadCidades}
                      className="underline font-semibold shrink-0"
                    >
                      Recarregar
                    </button>
                  </div>
                )}
              </div>

              {/* Bairro */}
              <div className="md:col-span-4">
                <label
                  htmlFor="hs-bairro"
                  className="text-xs font-semibold text-black/70"
                >
                  Bairro
                </label>
                <select
                  id="hs-bairro"
                  value={form.bairro}
                  onChange={(e) => handleChange("bairro", e.target.value)}
                  disabled={
                    !form.cidade || bairrosLoading || bairrosUI.length === 0
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none
                             focus:ring-2 focus:ring-[#C20010]/40 disabled:bg-black/[0.03] disabled:text-black/40"
                >
                  <option value="">
                    {!form.cidade
                      ? "Selecione uma cidade"
                      : bairrosLoading
                        ? "Carregando..."
                        : bairrosUI.length === 0
                          ? "Sem opções"
                          : "Todos"}
                  </option>

                  {bairrosUI.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                {bairrosError && (
                  <div className="mt-1.5 text-[11px] text-red-600 flex items-center justify-between gap-2">
                    <span className="truncate">{bairrosError}</span>
                    {form.cidade ? (
                      <button
                        type="button"
                        onClick={() => loadBairros(form.cidade)}
                        className="underline font-semibold shrink-0"
                      >
                        Recarregar
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                )}
              </div>

              {/* Quartos */}
              <div className="md:col-span-4">
                <label
                  htmlFor="hs-quartos"
                  className="text-xs font-semibold text-black/70"
                >
                  Quartos
                </label>
                <select
                  id="hs-quartos"
                  value={form.quartos}
                  onChange={(e) => handleChange("quartos", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C20010]/40"
                >
                  <option value="">Qualquer</option>
                  <option value="1">1 Quarto</option>
                  <option value="2">2 Quartos</option>
                  <option value="3">3 Quartos</option>
                  <option value="4">4+ Quartos</option>
                </select>
              </div>

              {/* Valor */}
              <div className="md:col-span-8">
                <label className="text-xs font-semibold text-black/70">
                  Valor
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-black/40">
                      R$
                    </span>
                    <input
                      value={form.valorMin}
                      onChange={(e) => handleChange("valorMin", e.target.value)}
                      placeholder="Mín"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C20010]/40"
                    />
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-black/40">
                      R$
                    </span>
                    <input
                      value={form.valorMax}
                      onChange={(e) => handleChange("valorMax", e.target.value)}
                      placeholder="Máx"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C20010]/40"
                    />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="md:col-span-12 pt-1">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C20010] px-4 py-3 text-sm font-extrabold tracking-wide text-white shadow
                             hover:brightness-110 transition focus:outline-none focus:ring-2 focus:ring-[#C20010]/40"
                >
                  <FiSearch className="text-lg" />
                  Buscar imóveis
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-black/5" />

            {/* Buscar por código (input group) */}
            <div>
              <label
                htmlFor="hs-codigo"
                className="text-xs font-semibold text-black/70"
              >
                Buscar por código
              </label>

              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <div className="relative flex-1">
                  <input
                    id="hs-codigo"
                    value={form.codigo}
                    onChange={(e) => handleChange("codigo", e.target.value)}
                    placeholder="Ex.: 1234"
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C20010]/40"
                  />
                  <div className="mt-1 text-[11px] text-black/45">
                    Digite o código e vá direto para o anúncio.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleSubmitCode(e as any)}
                  disabled={!isCodeMode}
                  className="w-full sm:w-auto rounded-xl bg-black/80 px-4 py-2.5 text-sm font-extrabold tracking-wide text-white
                             disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition
                             focus:outline-none focus:ring-2 focus:ring-[#C20010]/40"
                >
                  Ir para o imóvel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
