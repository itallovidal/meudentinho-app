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

export type API_ERROR_CODES = {
  UserNotFoundError: "USER_NOT_FOUND";
  InvalidCredentialsError: "INVALID_CREDENTIALS";
  InvalidPayloadError: "INVALID_PAYLOAD";
  InternalServerError: "INTERNAL_SERVER_ERROR";
  UserCreationError: "USER_CREATION_ERROR";
  KidCreationError: "KID_CREATION_ERROR";
  KidNotFound: "KID_NOT_FOUND";
  KidUpdateFailed: "KID_UPDATE_FAILED";
  KidDeleteFailed: "KID_DELETE_FAILED";
  JWTGenerationError: "JWT_GENERATION_ERROR";
  EnvLoadError: "ENV_LOAD_ERROR";
  EmailAlreadyInUseError: "EMAIL_ALREADY_IN_USE";
  CurrentPasswordInvalidError: "CURRENT_PASSWORD_INVALID";
  KidLimitExceededError: "KID_LIMIT_EXCEEDED";
  UserUpdateFailed: "USER_UPDATE_FAILED";
  UserDeleteFailed: "USER_DELETE_FAILED";
  ArticlesNotFound: "ARTICLES_NOT_FOUND";
  ArticlesCreateFailed: "ARTICLES_CREATE_FAILED";
  ArticlesUpdateFailed: "ARTICLES_UPDATE_FAILED";
  ArticlesDeleteFailed: "ARTICLES_DELETE_FAILED";
  CategoriesNotFound: "CATEGORIES_NOT_FOUND";
  CategoriesCreateFailed: "CATEGORIES_CREATE_FAILED";
  CategoryAlreadyExists: "CATEGORY_ALREADY_EXISTS";
  ToothEventsNotFound: "TOOTH_EVENTS_NOT_FOUND";
  ToothEventsCreateFailed: "TOOTH_EVENTS_CREATE_FAILED";
  ToothEventsUpdateFailed: "TOOTH_EVENTS_UPDATE_FAILED";
  ToothEventsDeleteFailed: "TOOTH_EVENTS_DELETE_FAILED";
  ToothEventDuplicateError: "TOOTH_EVENT_DUPLICATE";
  KidNotLinkedToParentError: "KID_NOT_LINKED_TO_PARENT";
  TooManyRequestsError: "TOO_MANY_REQUESTS";
  PayloadTooLargeError: "PAYLOAD_TOO_LARGE";
  RouteNotFoundError: "ROUTE_NOT_FOUND";
  MethodNotAllowedError: "METHOD_NOT_ALLOWED";
  ForbiddenError: "FORBIDDEN";
  PrivacyPolicyVersionMismatchError: "PRIVACY_POLICY_VERSION_MISMATCH";
  ResponseParseError: "RESPONSE_PARSE_ERROR";
  NetworkError: "NETWORK_ERROR";
  TimeoutError: "TIMEOUT";
};

export type ApiErrorCode = API_ERROR_CODES[keyof API_ERROR_CODES];

export interface ErrorPayload {
  message: string;
  code: ApiErrorCode;
}

export class ApiError extends Error implements ErrorPayload {
  code: ApiErrorCode;
  status?: number;

  constructor(
    message: string,
    code: ApiErrorCode,
    status?: number,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "ApiError";
    this.code = code;
    this.status = status;
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
