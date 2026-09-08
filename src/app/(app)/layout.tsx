import { Shell } from "@/components/shell/Shell";
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <Shell>{children}</Shell>;
}
