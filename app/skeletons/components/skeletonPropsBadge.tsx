import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper } from "@/components/wrapper";

const EXAMPLE_PROPS_LENGTH = 4;

export function SkeletonPropsBadge({
  className,
  wrap,
}: {
  className?: string;
  wrap?: boolean;
}) {
  return (
    <Wrapper
      direction="row"
      align="center"
      justify="center"
      gap="gap-2"
      className={` ${className || (wrap ? " flex-wrap " : " flex-nowrap ")} w-full`}
    >
      {Array.from({ length: EXAMPLE_PROPS_LENGTH }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-20 rounded bg-base-100" />
      ))}
    </Wrapper>
  );
}
