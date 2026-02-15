/**
 * Module for index
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
export * from "./admin";
export * from "./client";
export type { Session } from "./config";
export { auth, hasRole, isAdmin, isUser } from "./config";
