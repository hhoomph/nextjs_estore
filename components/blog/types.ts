export interface BlogAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

export interface BlogAuthorWithBio extends BlogAuthor {
  bio?: string | null;
}

export interface BlogCategorySummary {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface BlogCategoryWithCount extends BlogCategorySummary {
  description: string | null;
  icon: string | null;
  order: number;
  active: boolean;
  posts: { id: string }[];
}

export interface BlogTagSummary {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface BlogPostTagRelation {
  tag: BlogTagSummary;
}

export interface BlogPostListData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
  readingTime: number | null;
  viewCount: number;
  author: BlogAuthor;
  category: BlogCategorySummary;
  tags: BlogPostTagRelation[];
  comments: { id: string }[];
}

export interface BlogPostContentData extends BlogPostListData {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  author: BlogAuthorWithBio;
}

export type BlogCommentAuthor = BlogAuthor;

export interface BlogCommentReply {
  id: string;
  content: string;
  createdAt: Date;
  author: BlogCommentAuthor;
}

export interface BlogCommentData {
  id: string;
  content: string;
  createdAt: Date;
  author: BlogCommentAuthor;
  replies: BlogCommentReply[];
}
