// TODO: split this in multiple files: one for user, one for articles,

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  kids: Kid[];
}

export type BasicUser = Pick<User, "name" | "email" | "isAdmin">;

interface Kid {
  id: string;
  name: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
  parentId: string;
  isPremature: boolean;
  prematureWeeks?: number;
}

export interface Article {
  imageSrc: string;
  title: string;
  category: string;
  readingTime: string;
  id: string;
  className?: string;
  text: string;
}

const API_ERROR_CODES = {
  UserNotFoundError: "USER_NOT_FOUND",
  InvalidCredentialsError: "INVALID_CREDENTIALS",
  InvalidPayloadError: "INVALID_PAYLOAD",
  InternalServerError: "INTERNAL_SERVER_ERROR",
  UserCreationError: "USER_CREATION_ERROR",
} as const;

export interface ErrorPayload {
  message: string;
  code: (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
}

// should we move this to another file? maybe in a utils folder? or in the api folder?
export class ApiError implements ErrorPayload {
  message: string;
  code: (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

  constructor(
    message: string,
    code: (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES],
  ) {
    this.message = message;
    this.code = code;
  }

  json() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export interface MetaApiPayload {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ResponsePayload<T> {
  status: number;
  data: T;
  error?: ErrorPayload;
  meta?: MetaApiPayload;
}
