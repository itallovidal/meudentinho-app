import type { ReactNode } from "react";
import { Linking } from "react-native";
import { Text } from "@/components/ui/text";

export type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  onError?: () => void;
};

export function ExternalLink({
  href,
  children,
  className,
  onError,
}: ExternalLinkProps) {
  function openLink() {
    void Linking.openURL(href).catch(() => onError?.());
  }

  return (
    <Text accessibilityRole="link" onPress={openLink} className={className}>
      {children}
    </Text>
  );
}
