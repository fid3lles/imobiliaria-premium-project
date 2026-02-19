import React, { useEffect, useMemo, useRef, useState } from "react";

type Modalidade = "COMPRA" | "ALUGUEL" | "";

type Filters = {
  condominio?: string;
  bairro?: string;
  cidade?: string;
  aceitaPermuta?: boolean;

  tipo?: string;
  modalidade?: Modalidade;

  areaPrincipalMin?: number;
  areaPrincipalMax?: number;
  areaLoteMin?: number;
  areaLoteMax?: number;

  qtdQuartos?: number;
  qtdBanheiros?: number;
  qtdSuites?: number;
  qtdVagas?: number;

  caractInternasContem?: string[];
  caractExternasContem?: string[];

  valorImovelMin?: number;
  valorImovelMax?: number;
  valorCondominioMin?: number;
  valorCondominioMax?: number;
  valorIptuMin?: number;
  valorIptuMax?: number;

  page?: number;
};

const API_URL = import.meta.env.VITE_BACKEND_URL;

type Props = {
  initialValue?: Filters;
  onSearch?: (filters: Filters, result: unknown) => void;
  onResult: (data: any) => void;
  externalPage?: number;

  /** opcional: permite ajustar largura/estilo do container quando embutido no modal */
  className?: string;
};

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-2">
      {children}
    </div>
  );
}

function PillGroup<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value?: T;
  options: { label: string; value: T }[];
  onChange: (v?: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(active ? undefined : opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition",
              active
                ? "bg-[#65080F] text-white border-zinc-900"
                : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelectChips({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  loading,
  error,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div>
      <SectionTitle>{label}</SectionTitle>

      <div className="border border-zinc-200 rounded-lg p-2 bg-white">
        <div className="flex flex-wrap gap-2 mb-2">
          {value.length === 0 ? (
            <span className="text-sm text-zinc-400 px-1 py-1">
              {loading ? "Carregando..." : placeholder}
            </span>
          ) : (
            value.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange(value.filter((x) => x !== v))}
                className="text-sm px-2 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                title="Remover"
              >
                {v} <span className="ml-1 text-zinc-400">×</span>
              </button>
            ))
          )}
        </div>

        {error ? (
          <div className="text-sm text-red-600 px-1 py-2">{error}</div>
        ) : (
          <select
            className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400"
            value=""
            disabled={loading || options.length === 0}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              if (!value.includes(v)) onChange([...value, v]);
            }}
          >
            <option value="">
              {loading
                ? "Carregando..."
                : options.length === 0
                  ? "Sem opções"
                  : placeholder}
            </option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

function NumRange({
  title,
  minName,
  maxName,
  minValue,
  maxValue,
  onChange,
  unit,
}: {
  title: string;
  minName: keyof Filters;
  maxName: keyof Filters;
  minValue?: number;
  maxValue?: number;
  onChange: (name: keyof Filters, value?: number) => void;
  unit?: string;
}) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            value={minValue ?? ""}
            onChange={(e) =>
              onChange(
                minName,
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
              {unit}
            </span>
          )}
        </div>

        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            value={maxValue ?? ""}
            onChange={(e) =>
              onChange(
                maxName,
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

async function fetchStringList(url: string): Promise<string[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao buscar (${res.status})`);
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data) || !data.every((x) => typeof x === "string")) {
    throw new Error("Formato inválido (esperado: string[])");
  }
  return data;
}

function buildSearchUrl(baseUrl: string, filters: Filters) {
  const url = new URL(baseUrl, window.location.origin);

  const add = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;

    if (typeof value === "string") {
      const v = value.trim();
      if (!v) return;
      url.searchParams.append(key, v);
      return;
    }

    if (typeof value === "number") {
      if (Number.isNaN(value)) return;
      url.searchParams.append(key, String(value));
      return;
    }

    if (typeof value === "boolean") {
      url.searchParams.append(key, String(value));
      return;
    }

    if (Array.isArray(value)) {
      value
        .filter(
          (x): x is string => typeof x === "string" && x.trim().length > 0,
        )
        .forEach((x) => url.searchParams.append(key, x));
      return;
    }
  };

  add("condominio", filters.condominio);
  add("bairro", filters.bairro);
  add("cidade", filters.cidade);
  add("aceitaPermuta", filters.aceitaPermuta);
  add("tipo", filters.tipo);
  add("modalidade", filters.modalidade);

  add("areaPrincipalMin", filters.areaPrincipalMin);
  add("areaPrincipalMax", filters.areaPrincipalMax);
  add("areaLoteMin", filters.areaLoteMin);
  add("areaLoteMax", filters.areaLoteMax);

  add("qtdQuartos", filters.qtdQuartos);
  add("qtdBanheiros", filters.qtdBanheiros);
  add("qtdSuites", filters.qtdSuites);
  add("qtdVagas", filters.qtdVagas);

  add("caractInternasContem", filters.caractInternasContem);
  add("caractExternasContem", filters.caractExternasContem);

  add("valorImovelMin", filters.valorImovelMin);
  add("valorImovelMax", filters.valorImovelMax);
  add("valorCondominioMin", filters.valorCondominioMin);
  add("valorCondominioMax", filters.valorCondominioMax);
  add("valorIptuMin", filters.valorIptuMin);
  add("valorIptuMax", filters.valorIptuMax);

  // ✅ sempre manda page (default 0)
  add("page", filters.page ?? 0);

  return url.toString();
}

export default function FiltersPanel({
  initialValue,
  onSearch,
  onResult,
  externalPage,
  className,
}: Props) {
  const [cidades, setCidades] = useState<string[]>([]);
  const [cidadesLoading, setCidadesLoading] = useState(false);
  const [cidadesError, setCidadesError] = useState<string | null>(null);

  const [bairros, setBairros] = useState<string[]>([]);
  const [bairrosLoading, setBairrosLoading] = useState(false);
  const [bairrosError, setBairrosError] = useState<string | null>(null);

  const condominios = useMemo(
    () => ["Condomínio 1", "Condomínio 2", "Condomínio 3"],
    [],
  );

  const [showMore, setShowMore] = useState(false);

  const [internasOptions, setInternasOptions] = useState<string[]>([]);
  const [internasLoading, setInternasLoading] = useState(false);
  const [internasError, setInternasError] = useState<string | null>(null);

  const [externasOptions, setExternasOptions] = useState<string[]>([]);
  const [externasLoading, setExternasLoading] = useState(false);
  const [externasError, setExternasError] = useState<string | null>(null);

  const [tiposOptions, setTiposOptions] = useState<string[]>([]);
  const [tiposLoading, setTiposLoading] = useState(false);
  const [tiposError, setTiposError] = useState<string | null>(null);

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ✅ evita “double fetch” no mount (strict mode / effects duplicados)
  const didInitRef = useRef(false);

  const [filters, setFilters] = useState<Filters>(() => ({
    condominio: initialValue?.condominio ?? "",
    bairro: initialValue?.bairro ?? "",
    cidade: initialValue?.cidade ?? "",
    aceitaPermuta: initialValue?.aceitaPermuta,
    tipo: initialValue?.tipo ?? "",
    modalidade: (initialValue?.modalidade ?? "COMPRA") as Modalidade,

    areaPrincipalMin: initialValue?.areaPrincipalMin,
    areaPrincipalMax: initialValue?.areaPrincipalMax,
    areaLoteMin: initialValue?.areaLoteMin,
    areaLoteMax: initialValue?.areaLoteMax,

    qtdQuartos: initialValue?.qtdQuartos,
    qtdBanheiros: initialValue?.qtdBanheiros,
    qtdSuites: initialValue?.qtdSuites,
    qtdVagas: initialValue?.qtdVagas,

    caractInternasContem: initialValue?.caractInternasContem ?? [],
    caractExternasContem: initialValue?.caractExternasContem ?? [],

    valorImovelMin: initialValue?.valorImovelMin,
    valorImovelMax: initialValue?.valorImovelMax,
    valorCondominioMin: initialValue?.valorCondominioMin,
    valorCondominioMax: initialValue?.valorCondominioMax,
    valorIptuMin: initialValue?.valorIptuMin,
    valorIptuMax: initialValue?.valorIptuMax,

    page: initialValue?.page ?? 0, // ✅ default 0
  }));

  // ✅ submit que recebe o "next filters" (não usa closure velho)
  async function submitWith(next: Filters, e?: React.FormEvent) {
    e?.preventDefault();

    setSearchLoading(true);
    setSearchError(null);

    try {
      const path = await `${API_URL}/imobiliaria-core/api/v1/busca`;

      const url = buildSearchUrl(path, next);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Falha na busca (${res.status})`);

      const data = (await res.json()) as unknown;

      onSearch?.(next, data);
      onResult(data);

      console.log("BUSCA URL:", url);
      console.log("BUSCA RESULT:", data);
    } catch (err: any) {
      setSearchError(err?.message ?? "Erro ao buscar");
    } finally {
      setSearchLoading(false);
    }
  }

  function submit(e?: React.FormEvent) {
    return submitWith(filters, e);
  }

  // ✅ paginação vinda de fora (PropertyResultsGrid)
  useEffect(() => {
    if (externalPage === undefined) return;

    setFilters((prev) => {
      const current = prev.page ?? 0;
      if (current === externalPage) return prev;

      const next = { ...prev, page: externalPage };
      submitWith(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPage]);

  useEffect(() => {
    console.log("Filters updated:", filters);
  }, [filters]);

  // ✅ primeira busca (apenas 1x de verdade)
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const initialFilters: Filters = {
      ...(initialValue ?? {}),
      modalidade: (initialValue?.modalidade ?? "COMPRA") as Modalidade,
      page: initialValue?.page ?? 0,
    };

    setFilters(initialFilters);
    submitWith(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setField<K extends keyof Filters>(name: K, value: Filters[K]) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: name === "page" ? (value as any) : 0, // ✅ qualquer mudança reseta página
    }));
  }

  function clearAll() {
    setFilters({
      condominio: "",
      bairro: "",
      cidade: "",
      aceitaPermuta: false,
      tipo: "",
      modalidade: "COMPRA",
      caractInternasContem: [],
      caractExternasContem: [],
      page: 0,
    });
    setBairros([]);
    setBairrosError(null);
  }

  async function loadCidades() {
    setCidadesLoading(true);
    setCidadesError(null);
    try {
      const data = await fetchStringList(
        `${API_URL}/imobiliaria-core/api/v1/categoria/cidades`,
      );
      setCidades(data);
    } catch (err: any) {
      setCidades([]);
      setCidadesError(err?.message ?? "Erro ao carregar cidades");
    } finally {
      setCidadesLoading(false);
    }
  }

  async function loadBairros(cidade: string) {
    setBairrosLoading(true);
    setBairrosError(null);
    try {
      const url =
        `${API_URL}/imobiliaria-core/api/v1/categoria/bairros?cidade=` +
        encodeURIComponent(cidade);

      const data = await fetchStringList(url);
      setBairros(data);
    } catch (err: any) {
      setBairros([]);
      setBairrosError(err?.message ?? "Erro ao carregar bairros");
    } finally {
      setBairrosLoading(false);
    }
  }

  async function loadInternas() {
    setInternasLoading(true);
    setInternasError(null);
    try {
      const data = await fetchStringList(
        `${API_URL}/imobiliaria-core/api/v1/categoria/carac-internas`,
      );
      setInternasOptions(data);
    } catch (err: any) {
      setInternasOptions([]);
      setInternasError(err?.message ?? "Erro ao carregar");
    } finally {
      setInternasLoading(false);
    }
  }

  async function loadExternas() {
    setExternasLoading(true);
    setExternasError(null);
    try {
      const data = await fetchStringList(
        `${API_URL}/imobiliaria-core/api/v1/categoria/carac-externas`,
      );
      setExternasOptions(data);
    } catch (err: any) {
      setExternasOptions([]);
      setExternasError(err?.message ?? "Erro ao carregar");
    } finally {
      setExternasLoading(false);
    }
  }

  async function loadTiposImovel() {
    setTiposLoading(true);
    setTiposError(null);
    try {
      const data = await fetchStringList(
        `${API_URL}/imobiliaria-core/api/v1/categoria/tipo-imovel`,
      );
      setTiposOptions(data);
    } catch (err: any) {
      setTiposOptions([]);
      setTiposError(err?.message ?? "Erro ao carregar");
    } finally {
      setTiposLoading(false);
    }
  }

  useEffect(() => {
    loadCidades();
    loadInternas();
    loadExternas();
    loadTiposImovel();
  }, []);

  // ✅ quando cidade mudar: limpa bairro e carrega bairros
  useEffect(() => {
    const cidade = (filters.cidade ?? "").trim();

    // evita loop: só zera se já tiver algo setado
    setFilters((prev) => (prev.bairro ? { ...prev, bairro: "" } : prev));

    if (!cidade) {
      setBairros([]);
      setBairrosError(null);
      setBairrosLoading(false);
      return;
    }

    loadBairros(cidade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.cidade]);

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={submit}
        className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden min-w-89"
      >
        {/* Header / Abas */}
        <div className="p-4 border-b border-zinc-200">
          <div className="flex gap-2">
            {(
              [
                { label: "Comprar", value: "COMPRA" },
                { label: "Alugar", value: "ALUGUEL" },
              ] as const
            ).map((tab) => {
              const active = filters.modalidade === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setField("modalidade", tab.value)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition border",
                    active
                      ? "bg-[#65080F] text-white border-zinc-900"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-5">
          {/* Cidade (endpoint) */}
          <div>
            <SectionTitle>Cidade</SectionTitle>

            <div className="space-y-2">
              <select
                name="cidade"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400"
                value={filters.cidade ?? ""}
                disabled={cidadesLoading || cidades.length === 0}
                onChange={(e) => setField("cidade", e.target.value)}
              >
                <option value="">
                  {cidadesLoading
                    ? "Carregando..."
                    : cidades.length === 0
                      ? "Sem opções"
                      : "Todas"}
                </option>
                {cidades.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {cidadesError && (
                <div className="text-xs text-red-600 flex items-center justify-between">
                  <span>{cidadesError}</span>
                  <button
                    type="button"
                    onClick={loadCidades}
                    className="underline font-semibold"
                  >
                    Recarregar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bairro (depende de cidade) */}
          <div>
            <SectionTitle>Bairro</SectionTitle>

            <div className="space-y-2">
              <select
                name="bairro"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400"
                value={filters.bairro ?? ""}
                disabled={
                  !filters.cidade || bairrosLoading || bairros.length === 0
                }
                onChange={(e) => setField("bairro", e.target.value)}
              >
                <option value="">
                  {!filters.cidade
                    ? "Selecione uma cidade"
                    : bairrosLoading
                      ? "Carregando..."
                      : bairros.length === 0
                        ? "Sem opções"
                        : "Todos"}
                </option>
                {bairros.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {bairrosError && (
                <div className="text-xs text-red-600 flex items-center justify-between">
                  <span>{bairrosError}</span>
                  {filters.cidade ? (
                    <button
                      type="button"
                      onClick={() => loadBairros(filters.cidade!)}
                      className="underline font-semibold"
                    >
                      Recarregar
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Condomínio */}
          <div>
            <SectionTitle>Condomínio</SectionTitle>
            <select
              name="condominio"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              value={filters.condominio ?? ""}
              onChange={(e) => setField("condominio", e.target.value)}
            >
              <option value="">Qualquer</option>
              {condominios.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo do imóvel (endpoint) */}
          <div>
            <SectionTitle>Tipo do imóvel</SectionTitle>

            <div className="space-y-2">
              <select
                name="tipo"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400"
                value={filters.tipo ?? ""}
                disabled={tiposLoading || tiposOptions.length === 0}
                onChange={(e) => setField("tipo", e.target.value)}
              >
                <option value="">
                  {tiposLoading
                    ? "Carregando..."
                    : tiposOptions.length === 0
                      ? "Sem opções"
                      : "Selecione"}
                </option>
                {tiposOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {tiposError && (
                <div className="text-xs text-red-600 flex items-center justify-between">
                  <span>{tiposError}</span>
                  <button
                    type="button"
                    onClick={loadTiposImovel}
                    className="underline font-semibold"
                  >
                    Recarregar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botão Mais filtros */}
          <button
            type="button"
            onClick={() => setShowMore((s) => !s)}
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-400 transition flex items-center justify-between"
          >
            <span>Mais filtros</span>
            <span className="text-zinc-400">{showMore ? "−" : "+"}</span>
          </button>

          {/* Mais filtros */}
          {showMore && (
            <div className="space-y-5 pt-1">
              <div>
                <SectionTitle>Quartos</SectionTitle>
                <PillGroup
                  value={filters.qtdQuartos}
                  options={[
                    { label: "1", value: 1 },
                    { label: "2", value: 2 },
                    { label: "3", value: 3 },
                    { label: "4+", value: 4 },
                  ]}
                  onChange={(v) => setField("qtdQuartos", v)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <SectionTitle>Banheiros</SectionTitle>
                  <PillGroup
                    value={filters.qtdBanheiros}
                    options={[
                      { label: "1", value: 1 },
                      { label: "2", value: 2 },
                      { label: "3", value: 3 },
                      { label: "4+", value: 4 },
                    ]}
                    onChange={(v) => setField("qtdBanheiros", v)}
                  />
                </div>

                <div>
                  <SectionTitle>Vagas</SectionTitle>
                  <PillGroup
                    value={filters.qtdVagas}
                    options={[
                      { label: "1", value: 1 },
                      { label: "2", value: 2 },
                      { label: "3", value: 3 },
                      { label: "4+", value: 4 },
                    ]}
                    onChange={(v) => setField("qtdVagas", v)}
                  />
                </div>

                <div>
                  <SectionTitle>Suítes</SectionTitle>
                  <PillGroup
                    value={filters.qtdSuites}
                    options={[
                      { label: "1", value: 1 },
                      { label: "2", value: 2 },
                      { label: "3", value: 3 },
                      { label: "4+", value: 4 },
                    ]}
                    onChange={(v) => setField("qtdSuites", v)}
                  />
                </div>
              </div>

              <NumRange
                title="Valor do imóvel"
                minName="valorImovelMin"
                maxName="valorImovelMax"
                minValue={filters.valorImovelMin}
                maxValue={filters.valorImovelMax}
                onChange={setField}
                unit="R$"
              />

              <NumRange
                title="Valor do condomínio"
                minName="valorCondominioMin"
                maxName="valorCondominioMax"
                minValue={filters.valorCondominioMin}
                maxValue={filters.valorCondominioMax}
                onChange={setField}
                unit="R$"
              />

              <NumRange
                title="Valor do IPTU"
                minName="valorIptuMin"
                maxName="valorIptuMax"
                minValue={filters.valorIptuMin}
                maxValue={filters.valorIptuMax}
                onChange={setField}
                unit="R$"
              />

              <NumRange
                title="Área principal"
                minName="areaPrincipalMin"
                maxName="areaPrincipalMax"
                minValue={filters.areaPrincipalMin}
                maxValue={filters.areaPrincipalMax}
                onChange={setField}
                unit="m²"
              />

              <NumRange
                title="Área do lote"
                minName="areaLoteMin"
                maxName="areaLoteMax"
                minValue={filters.areaLoteMin}
                maxValue={filters.areaLoteMax}
                onChange={setField}
                unit="m²"
              />

              <div className="flex items-center gap-2">
                <input
                  id="aceitaPermuta"
                  name="aceitaPermuta"
                  type="checkbox"
                  checked={Boolean(filters.aceitaPermuta)}
                  onChange={(e) => setField("aceitaPermuta", e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <label
                  htmlFor="aceitaPermuta"
                  className="text-sm text-zinc-700"
                >
                  Aceita permuta
                </label>
              </div>

              <div className="flex items-center justify-between -mb-3">
                <div />
                <button
                  type="button"
                  onClick={loadInternas}
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 underline"
                >
                  Recarregar internas
                </button>
              </div>
              <MultiSelectChips
                label="Características internas"
                options={internasOptions}
                value={filters.caractInternasContem ?? []}
                onChange={(next) => setField("caractInternasContem", next)}
                placeholder="0 selecionados"
                loading={internasLoading}
                error={internasError}
              />

              <div className="flex items-center justify-between -mb-3">
                <div />
                <button
                  type="button"
                  onClick={loadExternas}
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 underline"
                >
                  Recarregar externas
                </button>
              </div>
              <MultiSelectChips
                label="Características externas"
                options={externasOptions}
                value={filters.caractExternasContem ?? []}
                onChange={(next) => setField("caractExternasContem", next)}
                placeholder="0 selecionados"
                loading={externasLoading}
                error={externasError}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-400 transition"
                >
                  Limpar
                </button>
              </div>

              {searchError && (
                <div className="text-sm text-red-600">{searchError}</div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={searchLoading}
            className={cn(
              "w-full rounded-lg py-3 text-sm font-extrabold tracking-widest uppercase transition",
              searchLoading
                ? "bg-zinc-300 text-zinc-600 cursor-not-allowed"
                : "bg-[#65080F] text-white hover:bg-[#96000c]",
            )}
          >
            {searchLoading ? "Buscando..." : "Buscar imóveis"}
          </button>

          {searchError && !showMore && (
            <div className="text-sm text-red-600">{searchError}</div>
          )}
        </div>
      </form>
    </div>
  );
}
