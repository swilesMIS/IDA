// Filters.ts

export interface Filter {
  filterID: number;
  filterName: string;
  isActive: boolean;
  filterOptions: {
    $values: FilterOption[];
  };
}

export interface EditableFilterApiItem {
  filterID: number;
  filterName: string;
  isActive: boolean;
  filterOptions: {
    $values: FilterOption[];
  };
}

export interface FilterOption {
  optionId: number;
  filterID: number;
  optionName: string;
  filter: { $ref: string };
  isActive: boolean;
}
