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

export interface ArticleCategoryDTO {
  id: string;
  name: string;
}

export interface ArticleCategory extends ArticleCategoryDTO {
  isSelected: boolean;
}
