import api from "@/lib/api";

// JSON yapına birebir uyan Interface
export interface Category {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    children?: Category[]; // İç içe yapı
}

export async function getCategoriesTree() {
    try {
        // Strapi v5 veya flatten yapıda parent'ı null olanları çekiyoruz.
        // Populate * ile tüm alt dalları alıyoruz.
        const res = await api.get("/categories?filters[parent][$null]=true&populate[children][populate]=*&sort=index:asc");

        // Senin JSON yapında veriler direkt array içinde geliyor
        return res.data.data ? res.data.data : res.data;
    } catch (error) {
        console.error("Kategoriler çekilemedi:", error);
        return [];
    }
}