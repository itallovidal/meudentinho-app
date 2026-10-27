import { ErrorState } from "@/components/errorState";
import { ScreenContent } from "@/components/screenContent";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrapper } from "@/components/wrapper";
import { SkeletonImage } from "../components/skeletonImage";
import { SkeletonText } from "../components/skeletonText";

type SkeletonArticlePageProps = {
  errorMessage?: string;
  onRetry?: () => void;
};

export function SkeletonArticlePage({
  errorMessage,
  onRetry,
}: SkeletonArticlePageProps = {}) {
  return (
    <Wrapper
      className="flex-1 bg-base-100"
      direction="column"
      align="center"
      justify="start"
      gap="gap-2"
    >
      <Header hasBackButton />

      <ScreenContent
        className="flex-1 bg-base-100"
        direction="column"
        align="start"
        justify="start"
        gap="gap-2"
      >
        {errorMessage && (
          <ErrorState
            title="Não foi possível carregar o artigo"
            message={errorMessage}
            onRetry={onRetry}
          />
        )}
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
      </ScreenContent>
    </Wrapper>
  );
}
