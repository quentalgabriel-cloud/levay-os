/**
 * Money helpers — LEVAY OS financeiro
 *
 * Padrão (ADR adr-arch-bloqueadoras-2026-05-14, Decisão #2):
 *   - DB: numeric(14,2) — string ao ler do Postgres
 *   - JS: bigint em centavos — aritmética exata
 *   - Conversão obrigatória nas bordas (server action → DB, DB → UI)
 *
 * Nota: usamos BigInt(N) em vez de literais Nn porque tsconfig.target=ES2017.
 */

export type Cents = bigint;

const ZERO = BigInt(0);
const HUNDRED = BigInt(100);

/**
 * Converte valor decimal ("123.45" ou 123.45) para centavos (bigint).
 *
 * @example toCents("123.45")    // 12345 (bigint)
 * @example toCents(0.1 + 0.2)   // 30    (bigint — sem drift de float)
 */
export const toCents = (decimal: string | number): Cents => {
  const num = typeof decimal === "string" ? parseFloat(decimal) : decimal;
  if (!Number.isFinite(num)) {
    throw new Error(`toCents: valor inválido (${decimal})`);
  }
  return BigInt(Math.round(num * 100));
};

/**
 * Converte centavos (bigint) para string decimal compatível com numeric(14,2).
 *
 * @example toDecimal(BigInt(12345)) // "123.45"
 */
export const toDecimal = (cents: Cents): string => {
  const negative = cents < ZERO;
  const abs = negative ? -cents : cents;
  const integerPart = abs / HUNDRED;
  const fractionalPart = abs % HUNDRED;
  const fractionalStr = fractionalPart.toString().padStart(2, "0");
  return `${negative ? "-" : ""}${integerPart}.${fractionalStr}`;
};

/**
 * Formata centavos como BRL ("R$ 1.234,56").
 *
 * @example formatBRL(BigInt(123456)) // "R$ 1.234,56"
 */
export const formatBRL = (cents: Cents): string => {
  const decimal = Number(cents) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(decimal);
};

/**
 * Soma N centavos com segurança (bigint → sem drift de float).
 *
 * @example sumCents([BigInt(100), BigInt(200), BigInt(50)]) // 350
 */
export const sumCents = (values: Cents[]): Cents =>
  values.reduce((acc, v) => acc + v, ZERO);

/**
 * Type guard para Cents.
 */
export const isCents = (value: unknown): value is Cents =>
  typeof value === "bigint";
