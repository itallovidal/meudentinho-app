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

export type BasicUser = Pick<User, "name" | "email" | "isAdmin"> & {
  kids?: Kid[];
};

export interface Kid {
  id: string;
  name: string;
  birthDate: Date;
  gender: "male" | "female";
  isPremature: boolean;
  prematureWeeks?: number;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
  readingTime: string;
}
