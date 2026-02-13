import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiHome,
  FiTag,
  FiGrid,
  FiDollarSign,
  FiPhone,
  FiCalendar,
  FiShare2,
} from "react-icons/fi";
import { redirectToWhatsapp } from "../utils/Whatsapp.utils";

/** ===== Types ===== */
type Modalidade = "COMPRA" | "ALUGUEL";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export type Property = {
  id: number;
  tipo: string;
  modalidade: Modalidade;

  cidade: string;
  bairro: string;
  condominio?: string | null;

  descricao?: string | null;

  areaPrincipal?: number | null;
  areaLote?: number | null;

  qtdQuartos?: number | null;
  qtdBanheiros?: number | null;
  qtdSuites?: number | null;
  qtdVagas?: number | null;

  valorCondominio?: number | null;
  valorImovel?: number | null;
  valorIptu?: number | null;

  aceitaPermuta?: boolean | null;

  midias?: string[] | null;

  caractInternas?: string[] | null;
  caractExternas?: string[] | null;
};

/** ===== Utils ===== */
function formatBRL(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatNumber(value?: number | null, suffix = "") {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("pt-BR")}${suffix}`;
}

function safeList(list?: string[] | null) {
  return Array.isArray(list) ? list.filter(Boolean) : [];
}

/** ===== UI bits ===== */
function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-zinc-200 animate-pulse rounded-2xl ${className}`} />
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
      {children}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-zinc-500">{label}</div>
        <div className="text-sm font-semibold text-zinc-900 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-zinc-900">{children}</h2>;
}

function PillButton({
  icon,
  children,
  variant = "dark",
  onClick,
  type = "button",
  disabled,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: "dark" | "light";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition";
  const styles =
    variant === "dark"
      ? "bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-white"
      : "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-60";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles}`}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  );
}

function Gallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;

  useEffect(() => {
    setActive(0);
  }, [images]);

  return (
    <div className="w-full">
      <div className="relative">
        {hasImages ? (
          <img
            src={images[active]}
            alt={`Foto ${active + 1}`}
            className="w-full aspect-[16/9] object-cover rounded-2xl border border-zinc-200"
            loading="lazy"
          />
        ) : (
          <SkeletonBlock className="w-full aspect-[16/9]" />
        )}

        {hasImages && images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setActive((i) => (i - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border border-zinc-200 flex items-center justify-center hover:bg-white"
              aria-label="Foto anterior"
            >
              <FiChevronLeft />
            </button>

            <button
              type="button"
              onClick={() => setActive((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border border-zinc-200 flex items-center justify-center hover:bg-white"
              aria-label="Próxima foto"
            >
              <FiChevronRight />
            </button>

            <div className="absolute left-3 bottom-3">
              <Badge>
                <FiGrid />
                {images.length} fotos
              </Badge>
            </div>
          </>
        )}
      </div>

      {hasImages && images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              type="button"
              key={src + idx}
              onClick={() => setActive(idx)}
              className={[
                "shrink-0 rounded-xl border overflow-hidden",
                idx === active ? "border-zinc-900" : "border-zinc-200",
              ].join(" ")}
              aria-label={`Selecionar foto ${idx + 1}`}
            >
              <img
                src={src}
                alt={`Miniatura ${idx + 1}`}
                className="h-16 w-24 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** ===== Page =====
 * Espera rota tipo: /imovel/:id
 * Busca: /imovel/{id}
 */
export default function PropertyDetailsPage() {
  const { id } = useParams(); // React Router v6
  const [data, setData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form (sidebar)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const images = useMemo(
    () => (Array.isArray(data?.midias) ? data!.midias! : []),
    [data],
  );
  const internas = useMemo(() => safeList(data?.caractInternas), [data]);
  const externas = useMemo(() => safeList(data?.caractExternas), [data]);

  const title = useMemo(() => {
    if (!data) return "";
    return `${data.tipo} ${data.modalidade === "COMPRA" ? "à venda" : "para alugar"}, ${data.bairro} - ${data.cidade}`;
  }, [data]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!id) throw new Error("ID do imóvel não encontrado na URL.");

        const res = await fetch(
          `${API_URL}/imobiliaria-core/api/v1/busca/${id}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Falha ao buscar imóvel (HTTP ${res.status}). ${text}`,
          );
        }

        const json = (await res.json()) as Property;

        setData(json);
        setForm((p) => ({
          ...p,
          message: `Olá, gostaria de mais informações sobre o imóvel: ${json.id}.`,
        }));
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message ?? "Erro ao carregar imóvel.");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [id]);

  const onContact = (message: string) => {
    redirectToWhatsapp(message);
  };

  const onShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert("Link copiado!");
    } catch {
      alert("Não foi possível copiar o link.");
    }
  };

  /** ===== Loading / Error states ===== */
  if (loading) {
    return (
      <div className="bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
          <div className="space-y-4">
            <SkeletonBlock className="h-5 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <SkeletonBlock className="w-full aspect-[16/9]" />
                <SkeletonBlock className="h-40 w-full" />
                <SkeletonBlock className="h-52 w-full" />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <SkeletonBlock className="h-60 w-full" />
                <SkeletonBlock className="h-72 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="rounded-2xl border border-red-200 bg-white p-6">
            <h1 className="text-lg font-semibold text-zinc-900">
              Não foi possível carregar o imóvel
            </h1>
            <p className="mt-2 text-sm text-zinc-700">
              {error ?? "Imóvel não encontrado."}
            </p>
            <button
              className="mt-4 rounded-2xl px-4 py-2 text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** ===== Render ===== */
  return (
    <div className="bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        {/* Breadcrumb (mobile-friendly) */}
        <nav className="text-sm text-zinc-500 flex flex-wrap gap-2 items-center">
          <span className="inline-flex items-center gap-2">
            <FiHome className="text-zinc-400" />
            Início
          </span>
          <span>/</span>
          <span className="capitalize">
            {data.modalidade === "COMPRA" ? "venda" : "aluguel"}
          </span>
          <span>/</span>
          <span className="capitalize">{data.tipo}</span>
          <span>/</span>
          <span className="inline-flex items-center gap-2">
            <FiMapPin className="text-zinc-400" />
            {data.bairro}
          </span>
        </nav>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left */}
          <div className="lg:col-span-8 space-y-6">
            <Gallery images={images} />

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>
                    <FiTag />
                    Cód. imóvel: {data.id}
                  </Badge>
                  {data.aceitaPermuta ? (
                    <Badge>✅ Aceita permuta</Badge>
                  ) : (
                    <Badge>❌ Não aceita permuta</Badge>
                  )}
                </div>

                <div className="text-2xl sm:text-3xl font-bold text-zinc-900">
                  {formatBRL(data.valorImovel)}
                </div>

                <h1 className="text-lg sm:text-xl font-semibold text-zinc-900">
                  {title}
                </h1>

                {/* Stats - grid adapta do mobile ao desktop */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard
                    icon={<FiGrid />}
                    label="Área Principal"
                    value={formatNumber(data.areaPrincipal, " m²")}
                  />
                  <StatCard
                    icon={<FiGrid />}
                    label="Área Lote"
                    value={formatNumber(data.areaLote, " m²")}
                  />
                  <StatCard
                    icon={<FiHome />}
                    label="Quartos"
                    value={formatNumber(data.qtdQuartos)}
                  />
                  <StatCard
                    icon={<FiHome />}
                    label="Banheiros"
                    value={formatNumber(data.qtdBanheiros)}
                  />
                  <StatCard
                    icon={<FiHome />}
                    label="Vagas"
                    value={formatNumber(data.qtdVagas)}
                  />
                  <StatCard
                    icon={<FiHome />}
                    label="Suítes"
                    value={formatNumber(data.qtdSuites)}
                  />
                  <StatCard
                    icon={<FiMapPin />}
                    label="Bairro"
                    value={data.bairro || "—"}
                  />
                  <StatCard
                    icon={<FiMapPin />}
                    label="Cidade"
                    value={data.cidade || "—"}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <SectionTitle>Descrição do imóvel</SectionTitle>
              <p className="mt-3 text-sm leading-relaxed text-zinc-700 whitespace-pre-line">
                {data.descricao?.trim()
                  ? data.descricao
                  : "Sem descrição informada no momento."}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <SectionTitle>Características internas</SectionTitle>
              {internas.length ? (
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {internas.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
                    >
                      <span className="h-2 w-2 rounded-full bg-zinc-900" />
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-500">
                  Nenhuma característica interna informada.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <SectionTitle>Características externas</SectionTitle>
              {externas.length ? (
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {externas.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
                    >
                      <span className="h-2 w-2 rounded-full bg-zinc-900" />
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-500">
                  Nenhuma característica externa informada.
                </p>
              )}
            </div>
          </div>

          {/* Right */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:top-6">
              <SectionTitle>Características extras</SectionTitle>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Cód. imóvel</span>
                  <span className="font-semibold text-zinc-900">{data.id}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Valor</span>
                  <span className="font-semibold text-zinc-900">
                    {formatBRL(data.valorImovel)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Condomínio</span>
                  <span className="font-semibold text-zinc-900">
                    {formatBRL(data.valorCondominio)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">IPTU</span>
                  <span className="font-semibold text-zinc-900">
                    {formatBRL(data.valorIptu)}
                  </span>
                </div>

                {data.condominio ? (
                  <div className="pt-2">
                    <div className="text-xs text-zinc-500">
                      Condomínio (nome)
                    </div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {data.condominio}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <PillButton
                  icon={<FiPhone />}
                  onClick={() =>
                    onContact("Olá, gostaria de mais informações!")
                  }
                >
                  Fale Conosco
                </PillButton>
                <PillButton
                  icon={<FiCalendar />}
                  variant="light"
                  onClick={() =>
                    onContact(
                      `Olá, gostaria de agendar uma visita no imóvel de código número ${data.id}.`,
                    )
                  }
                >
                  Agendar Visita
                </PillButton>
                <PillButton
                  icon={<FiShare2 />}
                  variant="light"
                  onClick={onShare}
                >
                  Compartilhar
                </PillButton>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <FiDollarSign className="text-zinc-700" />
                <SectionTitle>Tenho interesse</SectionTitle>
              </div>

              <form
                className="mt-4 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  onContact(
                    `Informações de contato:\nNome: ${form.name}\nEmail: ${form.email}\nNúmero: ${form.phone}\nMensagem: ${form.message}`,
                  );
                }}
              >
                <div>
                  <label className="text-xs text-zinc-600 font-medium">
                    Seu nome *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/15"
                    placeholder="Ex: Gabriel"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-600 font-medium">
                    Seu e-mail *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/15"
                    placeholder="seuemail@exemplo.com"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-600 font-medium">
                    Celular *
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/15"
                    placeholder="(11) 9 9999-9999"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-600 font-medium">
                    Mensagem
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/15 resize-none"
                  />
                </div>

                <p className="text-xs text-zinc-500">
                  Ao informar meus dados, eu concordo com a Política de
                  Privacidade.
                </p>

                <PillButton icon={<FiPhone />} type="submit">
                  Tenho interesse
                </PillButton>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
