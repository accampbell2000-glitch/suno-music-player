import { CalcForgedFooter } from "@/components/calcforge-footer";
import { CalcForgedHeader } from "@/components/calcforge-header";
import { JsonLd } from "@/components/json-ld";
import { getAppUrl } from "@/lib/site-url";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = getAppUrl();
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "CalcForged", url: `${siteUrl}/`, description: "Useful, transparent calculators for everyday decisions.", slogan: "Practical calculators. Straight answers." };
  return <div className="cf-site"><JsonLd data={organization} /><CalcForgedHeader /><main>{children}</main><CalcForgedFooter /></div>;
}
