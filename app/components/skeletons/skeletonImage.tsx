import { Skeleton } from "../ui/skeleton";
import { Wrapper } from "../wrapper";

export function SkeletonImage({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Wrapper
      className={`overflow-hidden rounded-lg ${
        size === "sm"
          ? "w-16 h-16"
          : size === "md"
            ? "w-32 h-32"
            : "w-full h-48"
      }`}
    >
      <Skeleton className="w-full h-full" />
    </Wrapper>
  );
}
