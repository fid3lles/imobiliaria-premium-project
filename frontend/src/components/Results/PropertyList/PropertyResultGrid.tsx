import React from "react";
import { FaCar } from "react-icons/fa";
import { FiMapPin, FiHome, FiDroplet, FiGrid } from "react-icons/fi";

type ModalidadeBack = "COMPRA" | "ALUGUEL" | "LANCAMENTOS" | string;

export type ImovelCardDTO = {
  id: number;
  tipo?: string | null;
  modalidade?: ModalidadeBack | null;

  cidade?: string | null;
  bairro?: string | null;
  condominio?: string | null;

  qtdQuartos?: number | null;
  qtdBanheiros?: number | null;
  qtdSuites?: number | null;
  qtdVagas?: number | null;

  areaPrincipal?: number | null;
  areaLote?: number | null;

  valorImovel?: number | null;
  valorCondominio?: number | null;
  valorIptu?: number | null;

  aceitaPermuta?: boolean | null;
  destaque?: boolean | null;

  descricao?: string | null;
  midias?: string[] | null;
};

export type PageResponse<T> = {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number; // página atual (0-based)
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type Props = {
  data: PageResponse<ImovelCardDTO>;
  onCardClick?: (imovel: ImovelCardDTO) => void;
  hrefBuilder?: (imovel: ImovelCardDTO) => string;

  /** NOVO: quando clicar na paginação, você faz o fetch da página */
  onPageChange?: (pageIndex: number) => void;

  /** Opcional: desabilita botões durante loading */
  loading?: boolean;

  /** Opcional: quantos números mostrar ao redor da página atual */
  siblingCount?: number; // default 1
};

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function formatBRL(v?: number | null) {
  if (v === undefined || v === null || Number.isNaN(v)) return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v);
}

function formatArea(v?: number | null) {
  if (v === undefined || v === null || Number.isNaN(v)) return null;
  const n = Math.round(v);
  return new Intl.NumberFormat("pt-BR").format(n) + " m²";
}

function modalidadeLabel(m?: string | null) {
  if (!m) return "—";
  const up = m.toUpperCase();
  if (up === "COMPRA" || up === "VENDA") return "Venda";
  if (up === "ALUGUEL") return "Aluguel";
  if (up === "LANCAMENTOS" || up === "LANÇAMENTOS") return "Lançamento";
  return m;
}

function getCover(midias?: string[] | null) {
  if (!midias || midias.length === 0) return null;
  return midias[0] ?? null;
}

function Stat({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string | number | null | undefined;
}) {
  return (
    <div className="flex items-center gap-1.5 text-zinc-600">
      <span className="text-[15px]">{icon}</span>
      <span className="text-sm font-medium">{label ?? "—"}</span>
    </div>
  );
}

function Badge({
  children,
  variant = "dark",
}: {
  children: React.ReactNode;
  variant?: "dark" | "light" | "brand";
}) {
  const styles =
    variant === "dark"
      ? "bg-zinc-900 text-white"
      : variant === "brand"
        ? "bg-emerald-600 text-white"
        : "bg-white/90 text-zinc-900 border border-white/60";
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase",
        styles,
      )}
    >
      {children}
    </span>
  );
}

function PropertyCard({
  item,
  onClick,
  href,
}: {
  item: ImovelCardDTO;
  onClick?: () => void;
  href?: string;
}) {
  const cover = getCover(item.midias);
  const price = formatBRL(item.valorImovel);
  const area = formatArea(item.areaPrincipal ?? item.areaLote);

  const title = `${item.tipo ?? "Imóvel"}${item.condominio ? ` • ${item.condominio}` : ""}`;
  const location = [item.bairro, item.cidade].filter(Boolean).join(" • ");

  const CardInner = (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative">
        <div className="aspect-[16/10] bg-zinc-100 overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-200 to-zinc-100 flex items-center justify-center">
              <div className="flex items-center gap-2 text-zinc-500">
                <FiHome className="text-xl" />
                <span className="text-sm font-semibold">Sem foto</span>
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge variant="dark">{modalidadeLabel(item.modalidade)}</Badge>
          {item.destaque ? <Badge variant="brand">Destaque</Badge> : null}
          {item.aceitaPermuta ? <Badge variant="light">Permuta</Badge> : null}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/95 backdrop-blur border border-white/60 rounded-lg px-3 py-2 flex items-center justify-between">
            <div className="text-zinc-900 font-extrabold text-lg leading-none">
              {price ?? "Consulte"}
            </div>
            <div className="text-[12px] text-zinc-600 font-semibold">
              cód. {item.id}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-1">
          <div className="text-zinc-900 font-extrabold text-[15px] leading-snug line-clamp-2">
            {title}
          </div>

          <div className="flex items-center gap-2 text-zinc-600">
            <FiMapPin className="text-[15px]" />
            <span className="text-sm line-clamp-1">{location || "—"}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-2">
          <Stat icon={<FiHome />} label={`${item.qtdQuartos ?? "—"} qts`} />
          <Stat
            icon={<FiDroplet />}
            label={`${item.qtdBanheiros ?? "—"} bhs`}
          />
          <Stat icon={<FaCar />} label={`${item.qtdVagas ?? "—"} vagas`} />
          <Stat icon={<FiGrid />} label={area ?? "—"} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-500">
            {item.valorCondominio != null ? (
              <span>
                Cond.:{" "}
                <b className="text-zinc-700">
                  {formatBRL(item.valorCondominio)}
                </b>
              </span>
            ) : (
              <span />
            )}
            {item.valorIptu != null ? (
              <span className="ml-3">
                IPTU:{" "}
                <b className="text-zinc-700">{formatBRL(item.valorIptu)}</b>
              </span>
            ) : null}
          </div>

          <span className="text-sm font-extrabold text-zinc-900 hover:underline">
            <a href={`/imovel/${item.id}`}>Ver detalhes →</a>
          </span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className="block">
        {CardInner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="text-left w-full">
      {CardInner}
    </button>
  );
}

/** --- Paginação (números + ellipsis) --- */
function getPaginationRange(
  current: number,
  total: number,
  siblingCount: number,
) {
  // current: 0-based
  const totalNumbersToShow = siblingCount * 2 + 5; // first, last, current, siblings, 2 dots
  if (total <= totalNumbersToShow) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total - 2);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 3;

  const range: Array<number | "dots"> = [0];

  if (showLeftDots) range.push("dots");
  else range.push(...Array.from({ length: leftSibling }, (_, i) => i + 1));

  range.push(
    ...Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, i) => leftSibling + i,
    ),
  );

  if (showRightDots) range.push("dots");
  else
    range.push(
      ...Array.from(
        { length: total - 1 - rightSibling },
        (_, i) => rightSibling + 1 + i,
      ),
    );

  range.push(total - 1);
  return range;
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled,
  siblingCount = 1,
}: {
  page: number; // 0-based
  totalPages: number;
  onPageChange?: (pageIndex: number) => void;
  disabled?: boolean;
  siblingCount?: number;
}) {
  if (!onPageChange || totalPages <= 1) return null;

  const items = getPaginationRange(page, totalPages, siblingCount);

  const baseBtn =
    "h-10 min-w-[40px] px-3 rounded-lg border text-sm font-extrabold transition";
  const ghost =
    "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed";
  const active = "bg-zinc-900 border-zinc-900 text-white";

  return (
    <nav className="mt-6 flex items-center justify-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 0}
        className={cn(baseBtn, ghost)}
      >
        ← Anterior
      </button>

      {items.map((it, idx) => {
        if (it === "dots") {
          return (
            <span
              key={`dots-${idx}`}
              className="h-10 px-2 flex items-center text-zinc-500 font-bold"
            >
              …
            </span>
          );
        }

        const isActive = it === page;
        return (
          <button
            key={it}
            type="button"
            onClick={() => onPageChange(it)}
            disabled={disabled}
            className={cn(baseBtn, isActive ? active : ghost)}
            aria-current={isActive ? "page" : undefined}
          >
            {it + 1}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages - 1}
        className={cn(baseBtn, ghost)}
      >
        Próxima →
      </button>
    </nav>
  );
}

export default function PropertyResultsGrid({
  data,
  onCardClick,
  hrefBuilder,
  onPageChange,
  loading,
  siblingCount = 1,
}: Props) {
  if (!data || data.empty || data.content.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-zinc-600">
        <div className="text-lg font-extrabold text-zinc-900">
          Nenhum imóvel encontrado
        </div>
        <div className="mt-1 text-sm">Tente ajustar os filtros.</div>
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-zinc-900 font-extrabold">
          {data.totalElements} imóve{data.totalElements === 1 ? "l" : "is"}{" "}
          encontrado{data.totalElements === 1 ? "" : "s"}
        </div>
        <div className="text-sm text-zinc-600">
          Página <b>{data.number + 1}</b> de <b>{data.totalPages}</b>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.content.map((item) => (
          <PropertyCard
            key={item.id}
            item={item}
            onClick={onCardClick ? () => onCardClick(item) : undefined}
            href={hrefBuilder ? hrefBuilder(item) : undefined}
          />
        ))}
      </div>

      {/* PAGINAÇÃO no fim */}
      <Pagination
        page={data.number}
        totalPages={data.totalPages}
        onPageChange={onPageChange}
        disabled={loading}
        siblingCount={siblingCount}
      />
    </section>
  );
}
