export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  accepted: boolean;
  acceptedPolicyVersion: string;
  acceptedAt: string;
  isLegalGuardian: boolean;
  guardianBirthDate: string;
}

export interface UserPatchRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserAuthResponseDTO {
  name: string;
  token: string;
  refreshToken?: string;
  email?: string;
  userId: string;
  isAdmin: boolean;
}

export interface KidRequestDTO {
  name: string;
  birthDate: string;
  prematureWeeks?: string;
  gender: "male" | "female";
  acceptedPolicyVersion: string;
  acceptedAt: string;
  requestId: string;
}

export interface KidResponseDTO {
  id: string;
  name: string;
  birthDate: string;
  prematureWeeks?: string;
  parentId: string;
  gender: "male" | "female";
  createdAt: string;
  updatedAt: string;
  acceptedPolicyVersion?: string;
  acceptedAt?: string;
  consentRequestId?: string;
}
