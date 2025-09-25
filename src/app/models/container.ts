export class Container {
  constructor(init?: Partial<Container>) {
    Object.assign(this, init);
  }

  name: string = '';
  properties: { name: string; value: string }[] = [];
  getPropertyValue(name: string): string {
    return this.properties.find(p => p.name === name)?.value || '';
  }
}



export class Pagination {
  page: number = 1;
  pageSize: number = 5;
  total: number = 0;
  hasNextPage: boolean = false;
}

export class GetAllContainersResponse extends Pagination {
  constructor(init?: Partial<GetAllContainersResponse>) {
    super();
    Object.assign(this, init);
  }
  items: Container[] = []
  getContainers(): Container[] {
    return this.items.map(i => new Container(i));
  }
}

export class GetAllContainersRequest {
  constructor(init?: Partial<GetAllContainersResponse>) {

    Object.assign(this, init);
  }
  page: number = 1;
  pageSize: number = 5;
  // filters?: {
  //   names?: string[];
  //   properties?: { name: string; values: string[] }[];
  // };
  // sortBy?: string;
}