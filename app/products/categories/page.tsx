import { redirect } from "next/navigation";

/**
 * Redirect /products/categories to /categories
 * This route doesn't exist but users might try to access it
 */
export default function CategoriesRedirect() {
  redirect("/categories");
}
