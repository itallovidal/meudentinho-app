export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
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
