export interface ApiResponse {
  $id: string;
  $values: DbCategory[];
}

export interface DbCategory {
  $id: string;
  db_categoryID: number;
  databaseID: number;
  optionName: string;
}
