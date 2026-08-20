import { z } from "zod";

/**
 * Regras espelhando o que o nexus-frontend antigo valida no client
 * (js/nexus-validation.js) — o backend só exige presença dos campos
 * obrigatórios (ver AuthService#registerProfessional/#registerCompany),
 * então isto é validação de UX, não uma regra do domínio.
 *
 * Os schemas aqui NÃO fazem `.transform()` de propósito: react-hook-form +
 * o `Form` do shadcn ficam mais simples de tipar quando o shape de entrada
 * e o de saída do zod são o mesmo (string sempre, mesmo quando vazia). A
 * conversão pra `string | null` / `number | null` que os *RequestDTO
 * esperam acontece no `onSubmit` de cada form (ver toNullable/toNumberOrNull
 * abaixo), não aqui.
 */

const PHONE_REGEX = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
const CEP_REGEX = /^\d{5}-?\d{3}$/;
const CNPJ_REGEX = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;

const phoneField = z
  .string()
  .trim()
  .refine((value) => value === "" || PHONE_REGEX.test(value), {
    message: "Telefone inválido. Use o formato (11) 99999-9999.",
  });

const cepField = z
  .string()
  .trim()
  .refine((value) => value === "" || CEP_REGEX.test(value), {
    message: "CEP inválido. Use o formato 00000-000.",
  });

const taxIdField = z
  .string()
  .trim()
  .refine((value) => value === "" || CNPJ_REGEX.test(value), {
    message: "CNPJ inválido. Use o formato 00.000.000/0001-00.",
  });

const moneyField = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    {
      message: "Valor inválido.",
    }
  );

/** string vazia/whitespace → null; senão o valor trimado (é assim que os *RequestDTO esperam "sem valor"). */
export function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** string vazia → null; senão o número (pros campos de expectativa salarial). */
export function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerProfessionalSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome completo."),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("E-mail inválido."),
  password: z.string().min(6, "Mínimo de 6 caracteres."),
  phone: phoneField,
  cep: cepField,
  expectedSalaryCLT: moneyField,
  expectedSalaryPJ: moneyField,
  freelanceMinExpectation: moneyField,
  freelanceMaxExpectation: moneyField,
});

export type RegisterProfessionalFormValues = z.infer<
  typeof registerProfessionalSchema
>;

export const registerCompanySchema = z.object({
  companyName: z.string().trim().min(1, "Informe o nome da empresa."),
  taxId: taxIdField,
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("E-mail inválido."),
  password: z.string().min(6, "Mínimo de 6 caracteres."),
  phone: phoneField,
  cep: cepField,
  description: z.string(),
});

export type RegisterCompanyFormValues = z.infer<typeof registerCompanySchema>;

export const registerCompanyLinkedInSchema = z.object({
  companyName: z.string().trim().min(1, "Informe o nome da empresa."),
  taxId: taxIdField,
  phone: phoneField,
  cep: cepField,
  description: z.string(),
});

export type RegisterCompanyLinkedInFormValues = z.infer<
  typeof registerCompanyLinkedInSchema
>;
