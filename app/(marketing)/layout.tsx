import { CalcForgeFooter } from "@/components/calcforge-footer";
import { CalcForgeHeader } from "@/components/calcforge-header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="cf-site"><CalcForgeHeader /><main>{children}</main><CalcForgeFooter /></div>;
}
