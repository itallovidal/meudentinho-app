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

export interface ArticlePreviewDTO {
  imageSrc: string;
  title: string;
  category: string;
  readingTime: string;
  id: string;
  className?: string;
}
