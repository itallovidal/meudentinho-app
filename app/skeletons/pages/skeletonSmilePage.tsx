import { Header } from "@/components/header";
import { Wrapper } from "@/components/wrapper";
import { SkeletonDentalMap } from "../components/SkeletonDentalMap";
import { SkeletonDentalTipCard } from "../components/skeletonDentalTipCard";
import { SkeletonKidSelector } from "../components/skeletonKidSelector";
import { SkeletonRecentEventsList } from "../components/skeletonRecentEventsList";
import { SkeletonTeethExchangeCard } from "../components/skeletonTeethExchangeCard";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";

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
        className="w-full px-6 py-4"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <Wrapper
          direction="column"
          align="center"
          justify="start"
          gap="gap-4"
          className="mb-7"
        >
          <SkeletonKidSelector />
          <SkeletonDentalMap />
          <SkeletonDentalTipCard />
          <SkeletonRecentEventsList />
          <SkeletonTeethExchangeCard />
        </Wrapper>
      </ScrollView>
    </Wrapper>
  );
}
