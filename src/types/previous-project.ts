/** Espelha com.main.nexus.dto.PreviousProjectDTO. */
export interface PreviousProjectDTO {
  id: number;
  title: string;
  description: string | null;
  technologies: string[];
  yearOfCompletion: number | null;
}
