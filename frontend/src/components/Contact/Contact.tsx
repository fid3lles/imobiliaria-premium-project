import React, { useMemo, useState } from "react";
import { redirectToWhatsapp } from "../../utils/Whatsapp.utils";

type Finalidade = "VENDER" | "ALUGAR" | "";
type Destinacao =
  | ""
  | "RESIDENCIAL"
  | "COMERCIAL"
  | "RESIDENCIAL_E_COMERCIAL"
  | "INDUSTRIAL"
  | "RURAL"
  | "TEMPORADA";

type FormState = {
  // Dados pessoais
  nome: string;
  telefone: string;
  email: string;

  // Dados do imóvel
  finalidade: Finalidade;
  tipo: string;
  destinacao: Destinacao;

  valor: string;
  valorCondominio: string;
  valorIptu: string;

  areaInterna: string;
  areaExterna: string;
  areaLote: string;

  andar: string;
  quartos: string;
  suites: string;
  banheiros: string;
  vagas: string;

  aceitaPermuta: boolean;
  aceitaFinanciamento: boolean;
  ocupado: boolean;

  // Endereço
  cep: string;
  endereco: string;
  numero: string;
  cidade: string;
  complemento: string;
  bairro: string;
};

const initialState: FormState = {
  nome: "",
  telefone: "",
  email: "",

  finalidade: "",
  tipo: "",
  destinacao: "",

  valor: "",
  valorCondominio: "",
  valorIptu: "",

  areaInterna: "",
  areaExterna: "",
  areaLote: "",

  andar: "",
  quartos: "",
  suites: "",
  banheiros: "",
  vagas: "",

  aceitaPermuta: false,
  aceitaFinanciamento: false,
  ocupado: false,

  cep: "",
  endereco: "",
  numero: "",
  cidade: "",
  complemento: "",
  bairro: "",
};

function onlyFilled(label: string, value: unknown) {
  const v = String(value ?? "").trim();
  if (!v || v === "0") return null;
  return `• ${label}: ${v}`;
}

function yesNo(label: string, value: boolean) {
  return `• ${label}: ${value ? "Sim" : "Não"}`;
}

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialState);
  const [agree, setAgree] = useState(false);

  const benefits = useMemo(
    () => [
      "Qualidade no atendimento com cliente em potencial",
      "Aumento em suas vendas com a melhor segmentação",
      "Maior visibilidade em seus anúncios",
    ],
    [],
  );

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildWhatsappMessage(f: FormState) {
    const lines: (string | null)[] = [];

    lines.push("Olá! Quero anunciar meu imóvel.");
    lines.push("");
    lines.push("*Dados pessoais*");
    lines.push(onlyFilled("Nome", f.nome));
    lines.push(onlyFilled("Telefone", f.telefone));
    lines.push(onlyFilled("E-mail", f.email));

    lines.push("");
    lines.push("*Dados do imóvel*");
    lines.push(
      onlyFilled(
        "Finalidade",
        f.finalidade === "VENDER"
          ? "Vender"
          : f.finalidade === "ALUGAR"
            ? "Alugar"
            : "",
      ),
    );
    lines.push(onlyFilled("Tipo", f.tipo));
    lines.push(
      onlyFilled(
        "Destinação",
        f.destinacao
          ? {
              RESIDENCIAL: "Residencial",
              COMERCIAL: "Comercial",
              RESIDENCIAL_E_COMERCIAL: "Residencial e Comercial",
              INDUSTRIAL: "Industrial",
              RURAL: "Rural",
              TEMPORADA: "Temporada",
              "": "",
            }[f.destinacao]
          : "",
      ),
    );

    lines.push(onlyFilled("Valor", f.valor ? `R$ ${f.valor}` : ""));
    lines.push(
      onlyFilled(
        "Valor do Condomínio",
        f.valorCondominio ? `R$ ${f.valorCondominio}` : "",
      ),
    );
    lines.push(
      onlyFilled("Valor do IPTU", f.valorIptu ? `R$ ${f.valorIptu}` : ""),
    );

    lines.push(
      onlyFilled("Área interna", f.areaInterna ? `${f.areaInterna} m²` : ""),
    );
    lines.push(
      onlyFilled("Área externa", f.areaExterna ? `${f.areaExterna} m²` : ""),
    );
    lines.push(
      onlyFilled("Área do lote", f.areaLote ? `${f.areaLote} m²` : ""),
    );

    lines.push(onlyFilled("Andar", f.andar));
    lines.push(onlyFilled("Quartos", f.quartos));
    lines.push(onlyFilled("Suítes", f.suites));
    lines.push(onlyFilled("Banheiros", f.banheiros));
    lines.push(onlyFilled("Vagas", f.vagas));

    lines.push("");
    lines.push("*Condições*");
    lines.push(yesNo("Aceita permuta", f.aceitaPermuta));
    lines.push(yesNo("Aceita financiamento", f.aceitaFinanciamento));
    lines.push(yesNo("Ocupado", f.ocupado));

    lines.push("");
    lines.push("*Endereço*");
    lines.push(onlyFilled("CEP", f.cep));
    lines.push(onlyFilled("Endereço", f.endereco));
    lines.push(onlyFilled("Número", f.numero));
    lines.push(onlyFilled("Complemento", f.complemento));
    lines.push(onlyFilled("Bairro", f.bairro));
    lines.push(onlyFilled("Cidade", f.cidade));

    return lines.filter(Boolean).join("\n");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nome.trim() || !form.telefone.trim() || !form.finalidade) return;
    if (!agree) return;

    const message = buildWhatsappMessage(form);
    redirectToWhatsapp(message);
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(101,8,15,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Anuncie seu imóvel
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-zinc-900">
              Mais visibilidade. Mais interessados. Mais chances de fechar
              negócio.
            </h1>
            <p className="max-w-2xl text-zinc-600">
              Preencha o formulário com as informações do imóvel e envie direto
              para o WhatsApp do captador.
            </p>
          </div>

          {/* Como funciona */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Preencha o formulário",
                d: "Informe dados pessoais, detalhes do imóvel e endereço.",
              },
              {
                n: "02",
                t: "Direcionamos para um especialista",
                d: "Seu contato chega ao captador responsável.",
              },
              {
                n: "03",
                t: "Agendamos a avaliação",
                d: "Contato para visita, fotos e documentação.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#65080F]/10 text-[#65080F] font-semibold">
                    {step.n}
                  </span>
                  <h3 className="font-semibold text-zinc-900">{step.t}</h3>
                </div>
                <p className="mt-2 text-sm text-zinc-600">{step.d}</p>
              </div>
            ))}
          </div>

          {/* Benefícios */}
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">
              Benefícios
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {benefits.map((b) => (
                <li
                  key={b}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Preencha e anuncie
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Campos com <span className="text-[#65080F]">*</span> são
                obrigatórios.
              </p>
            </div>
            <span className="hidden sm:inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
              Envio via WhatsApp
            </span>
          </div>

          {/* Dados pessoais */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">
              Dados pessoais
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Nome *">
                <input
                  value={form.nome}
                  onChange={(e) => setField("nome", e.target.value)}
                  className="input"
                  placeholder="Seu nome completo"
                  required
                />
              </Field>

              <Field label="Telefone *">
                <input
                  value={form.telefone}
                  onChange={(e) => setField("telefone", e.target.value)}
                  className="input"
                  placeholder="(11) 9XXXX-XXXX"
                  required
                />
              </Field>

              <Field label="E-mail">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="input"
                  placeholder="seuemail@exemplo.com"
                />
              </Field>
            </div>
          </div>

          {/* Dados do imóvel */}
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">
              Dados do imóvel
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Finalidade *">
                <select
                  value={form.finalidade}
                  onChange={(e) =>
                    setField("finalidade", e.target.value as Finalidade)
                  }
                  className="input"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="VENDER">Vender</option>
                  <option value="ALUGAR">Alugar</option>
                </select>
              </Field>

              <Field label="Tipo do imóvel">
                <input
                  value={form.tipo}
                  onChange={(e) => setField("tipo", e.target.value)}
                  className="input"
                  placeholder="Ex: Apartamento, Casa, Sala..."
                />
              </Field>

              <Field label="Destinação">
                <select
                  value={form.destinacao}
                  onChange={(e) =>
                    setField("destinacao", e.target.value as Destinacao)
                  }
                  className="input"
                >
                  <option value="">Selecione</option>
                  <option value="RESIDENCIAL">Residencial</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="RESIDENCIAL_E_COMERCIAL">
                    Residencial e Comercial
                  </option>
                  <option value="INDUSTRIAL">Industrial</option>
                  <option value="RURAL">Rural</option>
                  <option value="TEMPORADA">Temporada</option>
                </select>
              </Field>

              <Field label="Valor">
                <input
                  value={form.valor}
                  onChange={(e) => setField("valor", e.target.value)}
                  className="input"
                  placeholder="Ex: 450000"
                  inputMode="numeric"
                />
              </Field>

              <Field label="Valor do Condomínio">
                <input
                  value={form.valorCondominio}
                  onChange={(e) => setField("valorCondominio", e.target.value)}
                  className="input"
                  placeholder="Ex: 650"
                  inputMode="numeric"
                />
              </Field>

              <Field label="Valor do IPTU">
                <input
                  value={form.valorIptu}
                  onChange={(e) => setField("valorIptu", e.target.value)}
                  className="input"
                  placeholder="Ex: 120"
                  inputMode="numeric"
                />
              </Field>

              <Field label="Área interna (m²)">
                <input
                  value={form.areaInterna}
                  onChange={(e) => setField("areaInterna", e.target.value)}
                  className="input"
                  placeholder="Ex: 68"
                  inputMode="decimal"
                />
              </Field>

              <Field label="Área externa (m²)">
                <input
                  value={form.areaExterna}
                  onChange={(e) => setField("areaExterna", e.target.value)}
                  className="input"
                  placeholder="Ex: 12"
                  inputMode="decimal"
                />
              </Field>

              <Field label="Área do lote (m²)">
                <input
                  value={form.areaLote}
                  onChange={(e) => setField("areaLote", e.target.value)}
                  className="input"
                  placeholder="Ex: 150"
                  inputMode="decimal"
                />
              </Field>

              <Field label="Andar">
                <input
                  value={form.andar}
                  onChange={(e) => setField("andar", e.target.value)}
                  className="input"
                  placeholder="Ex: 7"
                  inputMode="numeric"
                />
              </Field>

              <Field label="Quartos">
                <input
                  value={form.quartos}
                  onChange={(e) => setField("quartos", e.target.value)}
                  className="input"
                  placeholder="Ex: 3"
                  inputMode="numeric"
                />
              </Field>

              <Field label="Suítes">
                <input
                  value={form.suites}
                  onChange={(e) => setField("suites", e.target.value)}
                  className="input"
                  placeholder="Ex: 1"
                  inputMode="numeric"
                />
              </Field>

              <Field label="Banheiros">
                <input
                  value={form.banheiros}
                  onChange={(e) => setField("banheiros", e.target.value)}
                  className="input"
                  placeholder="Ex: 2"
                  inputMode="numeric"
                />
              </Field>

              <Field label="Vagas">
                <input
                  value={form.vagas}
                  onChange={(e) => setField("vagas", e.target.value)}
                  className="input"
                  placeholder="Ex: 2"
                  inputMode="numeric"
                />
              </Field>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Check
                checked={form.aceitaPermuta}
                onChange={(v) => setField("aceitaPermuta", v)}
                label="Aceita permuta"
              />
              <Check
                checked={form.aceitaFinanciamento}
                onChange={(v) => setField("aceitaFinanciamento", v)}
                label="Aceita financiamento"
              />
              <Check
                checked={form.ocupado}
                onChange={(v) => setField("ocupado", v)}
                label="Ocupado"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">
              Endereço
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="CEP">
                <input
                  value={form.cep}
                  onChange={(e) => setField("cep", e.target.value)}
                  className="input"
                  placeholder="Ex: 09080-140"
                />
              </Field>

              <Field label="Endereço">
                <input
                  value={form.endereco}
                  onChange={(e) => setField("endereco", e.target.value)}
                  className="input"
                  placeholder="Rua, Avenida..."
                />
              </Field>

              <Field label="Número">
                <input
                  value={form.numero}
                  onChange={(e) => setField("numero", e.target.value)}
                  className="input"
                  placeholder="Ex: 123"
                />
              </Field>

              <Field label="Cidade">
                <input
                  value={form.cidade}
                  onChange={(e) => setField("cidade", e.target.value)}
                  className="input"
                  placeholder="Ex: Santo André"
                />
              </Field>

              <Field label="Complemento">
                <input
                  value={form.complemento}
                  onChange={(e) => setField("complemento", e.target.value)}
                  className="input"
                  placeholder="Apto, Bloco..."
                />
              </Field>

              <Field label="Bairro">
                <input
                  value={form.bairro}
                  onChange={(e) => setField("bairro", e.target.value)}
                  className="input"
                  placeholder="Ex: Jardim"
                />
              </Field>
            </div>
          </div>

          {/* Privacidade + CTA */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-start gap-3 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 bg-white accent-[#65080F]"
              />
              <span>
                Ao informar meus dados, eu concordo com a Política de
                Privacidade.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm(initialState);
                  setAgree(false);
                }}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 transition"
              >
                Limpar
              </button>

              <button
                type="submit"
                disabled={
                  !agree ||
                  !form.nome.trim() ||
                  !form.telefone.trim() ||
                  !form.finalidade
                }
                className="rounded-xl bg-[#65080F] px-6 py-3 text-sm font-semibold text-white hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anunciar imóvel
              </button>
            </div>
          </div>

          {/* Preview opcional */}
          <details className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-zinc-800">
              Ver prévia da mensagem do WhatsApp
            </summary>
            <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-700">
              {buildWhatsappMessage(form)}
            </pre>
          </details>
        </form>
      </section>

      {/* helpers tailwind */}
      <style>{`
        .input {
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid rgba(228,228,231,.95); /* zinc-200 */
          background: #fff;
          padding: 0.75rem 0.9rem;
          font-size: 0.95rem;
          color: rgb(24,24,27); /* zinc-900 */
          outline: none;
        }
        .input:focus {
          border-color: rgba(101,8,15,.55); /* #65080F */
          box-shadow: 0 0 0 4px rgba(101,8,15,.14); /* #65080F */
        }
        .input::placeholder {
          color: rgba(113,113,122,.85); /* zinc-500/600 */
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-zinc-700">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <span className="text-sm text-zinc-800">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          "relative h-7 w-12 rounded-full border transition",
          checked
            ? "bg-[#65080F]/90 border-[#65080F]/40"
            : "bg-zinc-200 border-zinc-300",
        ].join(" ")}
        aria-pressed={checked}
      >
        <span
          className={[
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition",
            checked ? "left-5" : "left-0.5",
          ].join(" ")}
        />
      </button>
    </label>
  );
}
