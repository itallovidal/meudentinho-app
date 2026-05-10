export interface LoginDTO {
  email: string;
  password: string;
}

export interface SignupDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// TODO: add refresh token later
export interface LoginResponseDTO {
  name: string;
  token: string;
  isAdmin: boolean;
}
