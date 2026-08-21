/**
 * Filtro extra de "oportunidade" reusado em quatro telas: pro/opportunities,
 * os três mapas (pro/company/admin) e admin/projects — mesmos campos em
 * todas (comentário do nexus-map.js original: "mesmos campos de
 * /admin/projects"). Um só tipo + predicado aqui evita reimplementar a
 * mesma lógica de match quatro vezes com o risco de divergir.
 */

export interface OpportunityFilters {
  search: string;
  modality: string;
  expLevels: string[];
  postedDate: string;
  projectType: string;
  skills: string[];
  contractType: string;
  minSalary: string;
  maxSalary: string;
  minBudget: string;
  maxBudget: string;
}

export const emptyOpportunityFilters: OpportunityFilters = {
  search: "",
  modality: "",
  expLevels: [],
  postedDate: "",
  projectType: "",
  skills: [],
  contractType: "",
  minSalary: "",
  maxSalary: "",
  minBudget: "",
  maxBudget: "",
};

export const experienceLevelOptions = [
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "TRAINEE", label: "Trainee" },
  { value: "JUNIOR", label: "Júnior" },
  { value: "PLENO", label: "Pleno" },
  { value: "SENIOR", label: "Sênior" },
];

export const contractTypeOptions = [
  { value: "CLT", label: "CLT" },
  { value: "PJ", label: "PJ" },
  { value: "FREELANCER", label: "Freelancer" },
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "TEMPORARY", label: "Temporário" },
];

/** Forma mínima que qualquer DTO de oportunidade (MatchResponseDTO.project, MapOpportunityDTO, ProjectResponseDTO) precisa ter pra ser filtrado. */
export interface FilterableOpportunity {
  title: string;
  companyName: string;
  opportunityType: string;
  workMode: string | null;
  experienceLevel: string | null;
  createdAt: string;
  projectType?: string | null;
  type?: string | null;
  requiredSkills: { name: string }[] | string[];
  contractType: string | null;
  monthlySalaryMin: number | null;
  monthlySalaryMax: number | null;
  minimumBudget: number | null;
  maximumBudget: number | null;
}

function skillNames(skills: { name: string }[] | string[]): string[] {
  return skills.map((s) => (typeof s === "string" ? s : s.name));
}

export function matchesOpportunityFilters(
  o: FilterableOpportunity,
  filters: OpportunityFilters
): boolean {
  const term = filters.search.trim().toLowerCase();
  const title = o.title.toLowerCase();
  const company = o.companyName.toLowerCase();
  const skills = skillNames(o.requiredSkills).map((s) => s.toLowerCase());
  const regime = o.projectType ?? o.type ?? null;

  const matchesSearch = !term || title.includes(term) || company.includes(term);
  const matchesModality = !filters.modality || o.workMode === filters.modality;
  const matchesContractType =
    !filters.contractType || o.contractType === filters.contractType;
  const matchesExpLevel =
    filters.expLevels.length === 0 ||
    (o.experienceLevel != null &&
      filters.expLevels.includes(o.experienceLevel));
  const matchesPostedDate =
    !filters.postedDate || o.createdAt.slice(0, 10) === filters.postedDate;
  const matchesProjectType =
    !filters.projectType || regime === filters.projectType;
  const matchesSkills = filters.skills.every((name) =>
    skills.includes(name.toLowerCase())
  );

  const min = parseFloat(filters.minBudget) || 0;
  const max = parseFloat(filters.maxBudget) || Infinity;
  let matchesBudget = true;
  if (o.opportunityType === "PROJECT") {
    matchesBudget =
      (o.maximumBudget ?? Infinity) >= min && (o.minimumBudget ?? 0) <= max;
  }

  const minSal = parseFloat(filters.minSalary) || 0;
  const maxSal = parseFloat(filters.maxSalary) || Infinity;
  let matchesSalary = true;
  if (
    o.opportunityType === "JOB" &&
    (filters.contractType === "CLT" || filters.contractType === "PJ")
  ) {
    matchesSalary =
      (o.monthlySalaryMax ?? Infinity) >= minSal &&
      (o.monthlySalaryMin ?? 0) <= maxSal;
  }

  return (
    matchesSearch &&
    matchesModality &&
    matchesContractType &&
    matchesExpLevel &&
    matchesPostedDate &&
    matchesProjectType &&
    matchesSkills &&
    matchesBudget &&
    matchesSalary
  );
}
