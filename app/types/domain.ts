export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean;
  kids: Kid[];
}

export type BasicUser = Pick<User, "name" | "email" | "isAdmin"> & {
  kids?: Kid[];
};

export interface Kid {
  id: string;
  name: string;
  birthDate: string;
  gender: "male" | "female";
  prematureWeeks?: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
}

const API_ERROR_CODES = {
  UserNotFoundError: "USER_NOT_FOUND",
  InvalidCredentialsError: "INVALID_CREDENTIALS",
  InvalidPayloadError: "INVALID_PAYLOAD",
  InternalServerError: "INTERNAL_SERVER_ERROR",
  UserCreationError: "USER_CREATION_ERROR",
  ToothEventDuplicateError: "TOOTH_EVENT_DUPLICATE",
  KidNotLinkedToParentError: "KID_NOT_LINKED_TO_PARENT",
  ResponseParseError: "RESPONSE_PARSE_ERROR",
} as const;

export interface ErrorPayload {
  message: string;
  code: (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
}

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
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ResponsePayload<T> {
  status: number;
  data: T;
  error?: ErrorPayload;
  meta?: MetaApiPayload;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  categories: string[];
  imageCoverURL: string;
  createdAt: string;
  updatedAt: string;
  readingTime: number;
}
