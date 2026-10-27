import { ScreenContent } from "@/components/screenContent";
import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { SkeletonDentalMap } from "../components/SkeletonDentalMap";
import { SkeletonDentalTipCard } from "../components/skeletonDentalTipCard";
import { SkeletonKidSelector } from "../components/skeletonKidSelector";
import { SkeletonRecentEventsList } from "../components/skeletonRecentEventsList";
import { SkeletonTeethExchangeCard } from "../components/skeletonTeethExchangeCard";
import { RefreshControl, ScrollView } from "react-native";

type SkeletonSmilePageProps = {
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function SkeletonSmilePage({
  refreshing = false,
  onRefresh,
}: SkeletonSmilePageProps) {
  return (
    <Wrapper
      direction="column"
      align="center"
      justify="start"
      className="flex-1 bg-base-200"
    >
      <Header />
      <ScrollView
        className="w-full"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <ScreenContent
          direction="column"
          align="center"
          justify="start"
          gap="gap-4"
          className="my-4"
        >
          <SkeletonKidSelector />
          <SkeletonDentalMap />
          <SkeletonDentalTipCard />
          <SkeletonRecentEventsList />
          <SkeletonTeethExchangeCard />
        </ScreenContent>
      </ScrollView>
    </Wrapper>
  );
}
