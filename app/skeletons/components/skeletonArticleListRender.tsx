import { Wrapper } from "@/components/wrapper";
import { SkeletonArticleBanner } from "./skeletonArticleBanner";
import { SkeletonArticleCard } from "./skeletonArticleCard";

export function SkeletonArticleListRender({
  showBanner = true,
}: {
  showBanner?: boolean;
}) {
  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="w-full flex-1 bg-base-200"
      gap="gap-2"
    >
      <Wrapper
        className="w-full flex-1"
        direction="column"
        align="start"
        justify="start"
        gap="gap-3"
      >
        {showBanner && <SkeletonArticleBanner />}
        <SkeletonArticleCard />
        <SkeletonArticleCard />
        <SkeletonArticleCard />
      </Wrapper>
    </Wrapper>
  );
}
