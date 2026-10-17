export interface ArticlePreviewDTO {
  imageCoverURL: string;
  title: string;
  categories: string[];
  readingTime: number;
  id: string;
  className?: string;
}

export interface ArticleRequestDTO {
  title: string;
  summary: string;
  content: string;
  categories: string[];
  imageCoverURL: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  isSelected: boolean;
}
