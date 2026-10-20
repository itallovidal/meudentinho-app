import { isTabName, rootScreenForRoute, type CrossTabOrigin } from "./types";

export type LooseNavigation = {
  canGoBack: () => boolean;
  goBack: () => void;
  getParent: () => LooseNavigation | undefined;
  navigate: (screen: string, params?: unknown) => void;
  getState?: () => { routes: Array<{ name: string }> };
  reset?: (state: { index: number; routes: Array<{ name: string }> }) => void;
};

export function resetToRouteRoot(
  navigation: LooseNavigation,
  routeName: string,
): boolean {
  const root = rootScreenForRoute(routeName);
  if (!root || root === routeName || !navigation.reset) {
    return false;
  }
  navigation.reset({ index: 0, routes: [{ name: root }] });
  return true;
}

export function goBackToOriginTab(
  navigation: LooseNavigation,
  routeName: string,
  params: CrossTabOrigin | undefined,
): boolean {
  if (!params?.fromTab || !isTabName(params.fromTab)) {
    return false;
  }

  const state = navigation.getState?.();
  const routes = state?.routes;
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else if (routes?.length === 1) {
    const currentName = routes[0]?.name ?? routeName;
    const root = rootScreenForRoute(currentName);
    if (root && currentName !== root) {
      navigation.reset?.({ index: 0, routes: [{ name: root }] });
    }
  } else if (!routes && routeName) {
    const root = rootScreenForRoute(routeName);
    if (root && routeName !== root) {
      navigation.reset?.({ index: 0, routes: [{ name: root }] });
    }
  }

  const target = navigation.getParent() ?? navigation;
  target.navigate(params.fromTab);
  return true;
}
