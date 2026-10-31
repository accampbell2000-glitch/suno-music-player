import { describe, expect, test } from "bun:test";
import { affiliateBottomPicks, affiliateDisclosure, affiliateTopPicks, affiliateUrl, AMAZON_TAG } from "../config/affiliate-links";
import { calculatorDefinitions } from "../lib/calculator-definitions";

describe("calculator affiliate coverage", () => {
  test("every calculator has exactly three distinct bottom options, separate from its in-calculator pick", () => {
    for (const calculator of calculatorDefinitions) {
      const picks = affiliateBottomPicks(calculator.slug);
      expect(picks).toHaveLength(3);
      expect(new Set(picks.map((pick) => pick.query)).size).toBe(3);
      const topPick = affiliateTopPicks[calculator.slug];
      if (topPick) expect(picks.map((pick) => pick.query)).not.toContain(topPick.query);
    }
  });

  test("all displayed Amazon options use the configured tracking tag", () => {
    const picks = [
      ...calculatorDefinitions.flatMap(({ slug }) => affiliateBottomPicks(slug)),
      ...Object.values(affiliateTopPicks),
    ];
    expect(AMAZON_TAG).toBeTruthy();
    for (const pick of picks) {
      expect(pick.name.length).toBeGreaterThan(0);
      expect(pick.blurb.length).toBeGreaterThan(0);
      expect(pick.query.length).toBeGreaterThan(0);
      expect(affiliateUrl(pick.query)).toContain(`tag=${AMAZON_TAG}`);
    }
  });

  test("includes Amazon's Associate statement", () => {
    expect(affiliateDisclosure).toContain("As an Amazon Associate I earn from qualifying purchases.");
  });
});
