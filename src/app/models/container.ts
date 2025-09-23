export interface Container {
  name: string;
  properties: { name: string; value: string }[];
}

export class Pagination {
  page: number = 1;
  pageSize: number = 5;
  total: number = 0;
  hasNextPage: boolean = false;
}

export interface GetAllContainersResponse extends Pagination {
  items: Container[];
}