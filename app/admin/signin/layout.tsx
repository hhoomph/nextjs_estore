/**
 * Module for admin signin layout
 *
 * This layout provides a standalone layout for the admin signin page,
 * bypassing the main admin layout which requires authentication.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

export default function AdminSignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  );
}
