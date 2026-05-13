export interface LoginDTO {
  email: string;
  password: string;
}

export interface SignupDTO {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

// TODO: add refresh token later
export interface UserAuthResponseDTO {
  name: string;
  token: string;
  isAdmin: boolean;
}

export interface KidRequestDTO {
  name: string;
  birthDate: string;
  prematureWeeks?: string;
  parentId: string;
  gender: "male" | "female";
}

export interface KidResponseDTO {
  id: string;
  name: string;
  birthDate: string;
  prematureWeeks?: string;
  parentId: string;
  gender: "male" | "female";
  isPremature: boolean;
  className?: string;
}
