import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { RefreshControl } from "react-native";
import { ScrollView } from "react-native";
import { SkeletonArticleBanner } from "../components/skeletonArticleBanner";
import { SkeletonArticleCard } from "../components/skeletonArticleCard";

type SkeletonArticleListPageProps = {
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function SkeletonArticleListPage({
  onRefresh,
  isRefreshing,
}: SkeletonArticleListPageProps) {
  return (
    <Wrapper
      direction="column"
      align="start"
      justify="start"
      className="w-full flex-1 bg-base-200"
      gap="gap-2"
    >
      <Header />
      <ScrollView
        className="w-full flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <Wrapper
          className="flex-1 px-6 py-4"
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
      </ScrollView>
    </Wrapper>
  );
}
