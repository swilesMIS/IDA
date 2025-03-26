// LinkGridItem.ts

export interface LinkGridItem {
  $id: string;
  id: number;
  title: string;
  imageData?: string | null;
  url: string;
  isActive: boolean;
  query?: string;
  categories?: string;
  tags?: string;
}
