import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper } from "@/components/wrapper";

export function SkeletonTeethExchangeCard() {
  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="w-full flex-1 rounded-2xl bg-base-100 px-11 py-6 shadow-sm shadow-base-300"
    >
      <Skeleton className="h-6 w-36 rounded-md" />
      <Skeleton className="mt-2 h-4 w-52 rounded-md" />
      <Skeleton className="mt-4 h-2 w-52 rounded-full" />
      <Skeleton className="mt-2 h-3 w-24 rounded-md" />
    </Wrapper>
  );
}
