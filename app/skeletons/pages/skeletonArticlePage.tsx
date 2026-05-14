import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper } from "@/components/wrapper";
import { SkeletonImage } from "../components/skeletonImage";
import { SkeletonText } from "../components/skeletonText";

export function SkeletonArticlePage() {
  return (
    <Wrapper
      className="flex-1 bg-base-100"
      direction="column"
      align="center"
      justify="start"
      gap="gap-2"
    >
      <Header hasBackButton />

      <Wrapper
        className="mx-8 flex-1 bg-base-100"
        direction="column"
        align="start"
        justify="start"
        gap="gap-2"
      >
        <Wrapper
          className="my-4 h-24 w-full flex-1"
          direction="row"
          align="center"
          gap="gap-2"
        >
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </Wrapper>

        <SkeletonImage size="lg" />
        <SkeletonText variant="h1" />
        <SkeletonText variant="p" />
        <SkeletonText variant="p" />
        <SkeletonText variant="p" />
        <SkeletonText variant="p" />
        <SkeletonText variant="large" />
        <SkeletonText variant="default" />
        <SkeletonText variant="h1" />
        <SkeletonText variant="p" />
        <SkeletonText variant="p" />
        <SkeletonText variant="p" />
        <SkeletonText variant="large" />
        <SkeletonText variant="default" />
      </Wrapper>
    </Wrapper>
  );
}
