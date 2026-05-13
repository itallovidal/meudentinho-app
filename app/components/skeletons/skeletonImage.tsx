import { Skeleton } from "../ui/skeleton";
import { Wrapper } from "../wrapper";

export function SkeletonImage({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Wrapper
      className={`overflow-hidden rounded-lg ${
        size === "sm"
          ? "h-16 w-16"
          : size === "md"
            ? "h-32 w-32"
            : "h-48 w-full"
      }`}
    >
      <Skeleton className="h-full w-full" />
    </Wrapper>
  );
}
