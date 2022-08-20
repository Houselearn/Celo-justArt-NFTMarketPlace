export interface Collection {
  id: string;
  name?: string;
}

export interface Item {
  id?: string;
  owner?: string;
  name: string;
  description: string;
  image: string;
  location: string;
  price: string;
  isItemListed?: boolean;
  history?: Transaction[];
}

export interface Transaction {
  id: number;
  tranType: string;
  from: string;
  price: string;
  createdAt: number;
}