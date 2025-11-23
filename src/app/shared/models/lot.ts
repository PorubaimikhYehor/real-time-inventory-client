export type LotProperty = { name: string; value: string };

export class Lot {
  constructor(init?: Partial<Lot>) {
    Object.assign(this, init);
  }

  name = '';
  properties: LotProperty[] = [];

  getPropertyValue(name: string): string {
    return this.properties.find(p => p.name === name)?.value || '';
  }
}

export class CreateLotRequest {
  constructor(init?: Partial<CreateLotRequest>) {
    Object.assign(this, init);
  }

  name = '';
  containerName = '';
  quantity = 0;
  properties: LotProperty[] = [];
}

export class UpdateLotRequest {
  constructor(init?: Partial<UpdateLotRequest>) {
    Object.assign(this, init);
  }

  name = '';
  properties: LotProperty[] = [];
}