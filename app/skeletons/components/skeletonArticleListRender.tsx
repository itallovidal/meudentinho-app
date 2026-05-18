import { Wrapper } from "@/components/wrapper";
import { SkeletonArticleBanner } from "./skeletonArticleBanner";
import { SkeletonArticleCard } from "./skeletonArticleCard";

export function SkeletonArticleListRender() {
  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="w-full flex-1 bg-base-200"
      gap="gap-2"
    >
        <Wrapper
          className="flex-1 w-full"
          direction="column"
          align="start"
          justify="start"
          gap="gap-3"
        >
          <SkeletonArticleBanner />
          <SkeletonArticleCard />
          <SkeletonArticleCard />
          <SkeletonArticleCard />
        </Wrapper>
    </Wrapper>
  );
}
