export interface Product {
    name: string;
    cash: number;
    bank: number;
}

export interface ProductGroupByDate {
    date: string; // "2025-10-25"
    products: Product[];
}
