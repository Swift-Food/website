import { fetchWithAuth } from "@/lib/api-client/auth-client";
import { API_BASE_URL } from "@/lib/constants";
import { CategoryWithSubcategories } from "@/types/catering.types";

class CategoryService {
  async getCategoriesWithSubcategories(): Promise<CategoryWithSubcategories[]> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/categories/with-subcategories`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch categories with subcategories");
    }

    return response.json();
  }
}

export const categoryService = new CategoryService();
