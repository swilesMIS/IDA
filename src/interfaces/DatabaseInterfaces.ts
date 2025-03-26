export interface AccessLevel {
  accessLevelID: number;
  id: number;
  name: string;
  description: string;
}

export interface DatabaseApiItem {
  databaseID: number;
  title: string;
  databaseNumber: string;
  lastUpdated: string;
  dataCreator: string;
  description: string;
  accessLevels: {
    $id: number;
    $values: AccessLevel[];
  };
}

export interface EditableDatabaseApiItem {
  databaseID: number;
  title: string;
  databaseNumber: string;
  lastUpdated: string;
  dataCreator: string;
  description: string;
  accessLevels: AccessLevel[];
}

export interface ApiResponse {
  $id: number;
  $values: DatabaseApiItem[];
}

export interface TransformedDataItem {
  id: number;
  title: string;
  author: string;
  access: string;
  lastUpdated: string;
}
