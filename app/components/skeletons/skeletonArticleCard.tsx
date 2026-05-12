import { Skeleton } from "../ui/skeleton";
import { Wrapper } from "../wrapper";

export function SkeletonArticleCard() {
  return (
    <Wrapper
      className="bg-base-100 rounded-lg p-3 border border-base-200"
      direction="row"
      align="center"
      justify="start"
      gap="gap-3"
    >
      <Skeleton className="w-24 h-24 rounded-lg" />
      <Wrapper direction="column" className="flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2 mt-2" />
      </Wrapper>
    </Wrapper>
  );
}
