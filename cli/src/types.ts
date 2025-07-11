export type Template = "neon" | "supabase" | "d1";

export type Flags = Array<
  "install-dependencies" | "initialize-git" | "setup-neon"
>;

export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};
