export interface RequestKidDTO {
  name: string;
  birthDate: string;
  gender: "male" | "female";
  isPremature: boolean;
  prematureWeeks?: number;
}
