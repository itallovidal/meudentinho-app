import { Skeleton } from "@/components/ui/skeleton";

type TextVariant =
  | "default"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "blockquote"
  | "code"
  | "lead"
  | "large"
  | "small"
  | "muted";

export function SkeletonText({
  variant = "default",
}: {
  variant?: TextVariant;
}) {
  const sizes = {
    default: "h-5 w-48",
    h1: "h-9 w-52 mt-4",
    h2: "h-8 w-56 mt-4",
    h3: "h-7 w-48 mt-4",
    h4: "h-6 w-40 mt-4",
    p: "h-5 w-80",
    blockquote: "h-6 w-11/12",
    code: "h-5 w-32",
    lead: "h-6 w-56",
    large: "h-6 w-64",
    small: "h-4 w-32",
    muted: "h-4 w-24",
  };

  return <Skeleton className={sizes[variant]} />;
}
