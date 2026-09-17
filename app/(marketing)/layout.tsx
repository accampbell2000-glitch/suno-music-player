import { CalcForgedFooter } from "@/components/calcforge-footer";
import { CalcForgedHeader } from "@/components/calcforge-header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="cf-site"><CalcForgedHeader /><main>{children}</main><CalcForgedFooter /></div>;
}
