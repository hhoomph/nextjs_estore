/**
 * Wishlist page - redirects to locale version
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { redirect } from "next/navigation";

export default function WishlistPage() {
  redirect("/wishlist");
}
