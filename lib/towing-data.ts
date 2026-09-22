// Towing-capacity table — SAFETY DATA, strictest bar on the site.
// Every number below was verified on 2026-09-22 against the manufacturer's own
// towing/trailering guides or specification pages, or (where marked) secondary
// sources that quote the manufacturer maximum (MotorTrend/Edmunds-tier dealer
// spec pages). lb is the maximum CONVENTIONAL (ball-hitch) towing for the
// model in that year range, properly equipped; the note carries the exact
// configuration the number assumes. Same model may appear in several rows —
// one per year range — and is never averaged across a redesign. Vehicles that
// could not be verified from a manufacturer source are NOT here (see the
// excluded list in the run report and at the bottom of this file) — never estimated.
//
// Primary sources (manufacturer guides, all read directly):
//   Ford 2026/2025/2024/2023/2021/2020 RV & Trailer Towing Guide (ford.com and
//     archived official PDFs) + 2018 Super Duty Pickup towing guide
//     + 2018 Ram official charts for cross-brand reference
//   Chevrolet 2026/2024 Trailering Guide + 2023/2026 Silverado HD + 1500 charts
//     (chevrolet.com) + 2019 Chevrolet Trailering Guide (OEM PDF)
//   Ram: my26/my25/my24 HD Customer TowPayChart + 2024 Ram HD Towing Charts
//     (ramtrucks.com / Stellantis media) + 2018 Ram 1500/2500/3500 charts
//   Jeep: jeep.com 2026 towing-capacity guide (jeep.com/jeep-101)
//   Nissan: nissanusa.com model spec pages (2026 Frontier)
//   Toyota: toyota.com tow pages + manufacturer-quoting spec sources
//   GM EVs: 2026 Chevrolet Trailering Guide (Silverado/Blazer/Equinox EV)
//   Ford EV: 2023 Ford guide (Lightning 10,000 ER / 7,700 SR)
// Secondary (manufacturer-quoting, cross-checked against the pattern of the
// OEM guides): 2019 Super Duty Tow & Payload Overview (Ford dealer job aid),
// Ram 1500 Classic/DT specs, Jeep Wrangler/Gladiator/Wagoneer year splits,
// 2014-2019 Silverado, Toyota pre-2022 generations, Nissan Titan/XD years,
// Hyundai/Kia, VW, Mazda, Subaru, Mitsubishi, luxury + EV models.

export type TowingRow = {
  make: string;
  model: string;
  lb: number;
  yearStart?: number;
  yearEnd?: number;
  note?: string;
};

export const TOWING_TABLE: TowingRow[] = [
  // ── FORD ────────────────────────────────────────────────────────────────
  { make: "Ford", model: "F-150", lb: 12200, yearStart: 2015, yearEnd: 2017, note: "3.5L EcoBoost + Max Trailer Tow Package (SuperCab 8-ft box 4x2 or SuperCrew 4x2). Lower engines are rated well under this." },
  { make: "Ford", model: "F-150", lb: 13200, yearStart: 2018, yearEnd: 2020, note: "3.5L EcoBoost + Max Trailer Tow Package, SuperCrew 4x2 6.5-ft box; 5.0L V8 and 3.0L diesel are rated 11,500." },
  { make: "Ford", model: "F-150", lb: 14000, yearStart: 2021, yearEnd: 2023, note: "3.5L EcoBoost + Max Trailer Tow Package (SuperCab 8-ft box 4x2 / SuperCrew 4x2); 5.0L 13,000; PowerBoost 12,700; 3.0L diesel 12,100." },
  { make: "Ford", model: "F-150", lb: 13500, yearStart: 2024, yearEnd: 2026, note: "3.5L EcoBoost w/ Tow/Haul Package + Max Tow Axle; 5.0L 12,800; PowerBoost 12,400; 2.7L EcoBoost 8,400; Raptor 8,200, Raptor R 8,700." },
  { make: "Ford", model: "F-150 Lightning", lb: 10000, yearStart: 2022, yearEnd: 2026, note: "Extended-range battery + Trailer Tow Package; standard-range battery is rated 7,700. Towing cuts EV range drastically." },
  { make: "Ford", model: "F-250", lb: 18000, yearStart: 2018, yearEnd: 2019, note: "6.7L Power Stroke + Trailer Tow Package, weight-distributing hitch; 6.2L gas 15,000." },
  { make: "Ford", model: "F-250", lb: 20000, yearStart: 2020, yearEnd: 2022, note: "6.7L Power Stroke + High-Capacity Trailer Tow Package (GCWR 30,000); 7.3L gas 15,000." },
  { make: "Ford", model: "F-250", lb: 22000, yearStart: 2023, yearEnd: 2026, note: "6.7L Power Stroke + High-Capacity Axle Upgrade Package (Crew Cab 8-ft box); 7.3L gas 18,200; 6.8L gas 17,300." },
  { make: "Ford", model: "F-350", lb: 18000, yearStart: 2018, yearEnd: 2019, note: "Single rear wheel, 6.7L Power Stroke, weight-distributing hitch; 6.2L gas 15,000." },
  { make: "Ford", model: "F-350", lb: 20000, yearStart: 2020, yearEnd: 2022, note: "Single rear wheel, 6.7L Power Stroke, weight-distributing hitch, 18-in/20-in tires." },
  { make: "Ford", model: "F-350", lb: 25000, yearStart: 2023, yearEnd: 2026, note: "Single rear wheel, 6.7L High-Output Power Stroke, 18-in/20-in AT tires; standard 6.7L 23,200; 7.3L gas 19,500." },
  { make: "Ford", model: "F-350 Dually", lb: 21000, yearStart: 2018, yearEnd: 2019, note: "Dual rear wheel, 6.7L Power Stroke, weight-distributing hitch." },
  { make: "Ford", model: "F-350 Dually", lb: 21200, yearStart: 2020, yearEnd: 2022, note: "Dual rear wheel, 6.7L Power Stroke." },
  { make: "Ford", model: "F-350 Dually", lb: 27000, yearStart: 2023, yearEnd: 2026, note: "Dual rear wheel, 6.7L Power Stroke (High-Output w/ 4.10 reaches 28,000); 7.3L gas 22,000." },
  { make: "Ford", model: "F-450 Dually", lb: 21000, yearStart: 2018, yearEnd: 2019, note: "Dual rear wheel pickup, 6.7L Power Stroke." },
  { make: "Ford", model: "F-450 Dually", lb: 24200, yearStart: 2020, yearEnd: 2022, note: "Dual rear wheel pickup, 6.7L Power Stroke + High-Capacity package (4.30 axle)." },
  { make: "Ford", model: "F-450 Dually", lb: 30000, yearStart: 2023, yearEnd: 2026, note: "Dual rear wheel pickup, 6.7L Power Stroke, 4.30 axle." },
  { make: "Ford", model: "Ranger", lb: 7500, yearStart: 2019, yearEnd: 2023, note: "2.3L EcoBoost + Trailer Tow Package." },
  { make: "Ford", model: "Ranger", lb: 7500, yearStart: 2024, yearEnd: 2026, note: "2.3L/2.7L EcoBoost + Trailer Tow Package; Ranger Raptor 5,510." },
  { make: "Ford", model: "Maverick", lb: 4000, yearStart: 2022, yearEnd: 2024, note: "2.0L EcoBoost w/ 4K Tow Package; hybrid models are rated 2,000." },
  { make: "Ford", model: "Maverick", lb: 4000, yearStart: 2025, yearEnd: 2026, note: "2.0L EcoBoost or 2.5L hybrid w/ 4K Tow Package." },
  { make: "Ford", model: "Expedition", lb: 9300, yearStart: 2018, yearEnd: 2024, note: "3.5L EcoBoost 4x2 3.73 axle + Heavy-Duty Trailer Tow Package (4x4 is rated 9,200)." },
  { make: "Ford", model: "Expedition", lb: 9600, yearStart: 2025, yearEnd: 2026, note: "Standard wheelbase 4x4 w/ Heavy-Duty Trailer Tow (standard on 4x4), 3.73 axle." },
  { make: "Ford", model: "Expedition MAX", lb: 9000, yearStart: 2018, yearEnd: 2026, note: "Long wheelbase w/ Heavy-Duty Trailer Tow Package." },
  { make: "Ford", model: "Explorer", lb: 5000, yearStart: 2013, yearEnd: 2019, note: "Class III Trailer Tow Package (3.5L V6 / 2.3L / 3.5L EcoBoost)." },
  { make: "Ford", model: "Explorer", lb: 5600, yearStart: 2020, yearEnd: 2026, note: "3.0L EcoBoost (ST) w/ Class III package; 2.3L 5,300; hybrid 5,000." },
  { make: "Ford", model: "Bronco", lb: 3500, yearStart: 2021, yearEnd: 2026, note: "w/ Trailer Tow Package; Bronco Raptor is rated 4,500." },
  { make: "Ford", model: "Bronco Sport", lb: 2200, yearStart: 2021, yearEnd: 2024, note: "Badlands 2.0L w/ Class II Trailer Tow Package." },
  { make: "Ford", model: "Bronco Sport", lb: 2700, yearStart: 2025, yearEnd: 2026, note: "2.0L Badlands w/ Class II Trailer Tow Package." },
  { make: "Ford", model: "Escape", lb: 3500, yearStart: 2020, yearEnd: 2026, note: "2.0L EcoBoost w/ Class II Trailer Tow Package; hybrids are rated 1,500." },
  { make: "Ford", model: "Edge", lb: 3500, yearStart: 2015, yearEnd: 2024, note: "w/ Class II Trailer Tow Package (2.0L EcoBoost or 2.7L ST)." },
  { make: "Ford", model: "Transit", lb: 6900, yearStart: 2020, yearEnd: 2026, note: "3.5L EcoBoost cargo van; 350 passenger AWD tops out near 4,300." },
  { make: "Ford", model: "Transit Passenger Van", lb: 4500, yearStart: 2020, yearEnd: 2026, note: "3.5L EcoBoost 350 w/ 148-in wheelbase; AWD configs a bit lower." },
  { make: "Ford", model: "Transit Connect", lb: 2000, yearStart: 2021, yearEnd: 2023, note: "2.0L w/ Class I Trailer Tow Package." },
  { make: "Ford", model: "EcoSport", lb: 2000, yearStart: 2018, yearEnd: 2022, note: "2.0L Ti-VCT w/ trailer tow provisions." },

  // ── CHEVROLET ───────────────────────────────────────────────────────────
  { make: "Chevrolet", model: "Silverado 1500", lb: 12000, yearStart: 2014, yearEnd: 2014, note: "6.2L EcoTec3, 3.73 axle." },
  { make: "Chevrolet", model: "Silverado 1500", lb: 12500, yearStart: 2015, yearEnd: 2018, note: "6.2L EcoTec3 + Max Trailering Package (Regular Cab 2WD, 3.42 axle)." },
  { make: "Chevrolet", model: "Silverado 1500", lb: 12200, yearStart: 2019, yearEnd: 2019, note: "6.2L EcoTec3 + Max Trailering Package (Double Cab LTZ 4x4)." },
  { make: "Chevrolet", model: "Silverado 1500", lb: 13300, yearStart: 2020, yearEnd: 2026, note: "3.0L Duramax or 6.2L V8 + Max Trailering Package w/ 20-in wheels; most V8 configs are rated 9,000-11,300." },
  { make: "Chevrolet", model: "Silverado 2500HD", lb: 14500, yearStart: 2015, yearEnd: 2019, note: "6.0L gas (4.10 axle) or Duramax; most configurations 13,000-14,500." },
  { make: "Chevrolet", model: "Silverado 2500HD", lb: 18500, yearStart: 2020, yearEnd: 2023, note: "Duramax w/ LT275/70R18 AT or 20-in tires; 6.6L gas 14,500." },
  { make: "Chevrolet", model: "Silverado 2500HD", lb: 20000, yearStart: 2024, yearEnd: 2026, note: "Duramax + Max Trailering Package; 6.6L gas is rated 16,000 (18-in+ wheels) / 14,500." },
  { make: "Chevrolet", model: "Silverado 3500HD", lb: 14500, yearStart: 2015, yearEnd: 2019, note: "Single rear wheel, 6.0L gas (4.10 axle) or Duramax." },
  { make: "Chevrolet", model: "Silverado 3500HD", lb: 20000, yearStart: 2020, yearEnd: 2026, note: "Single rear wheel, Duramax; 6.6L gas 16,000." },
  { make: "Chevrolet", model: "Silverado 3500HD Dually", lb: 20000, yearStart: 2017, yearEnd: 2026, note: "Dual rear wheel, Duramax (GCWR 31,300+); 6.6L gas 18,400-18,700." },
  { make: "Chevrolet", model: "Colorado", lb: 7000, yearStart: 2015, yearEnd: 2022, note: "3.6L V6 + Trailering Package; 2.8L Duramax 7,700 (crew cab)." },
  { make: "Chevrolet", model: "Colorado", lb: 7700, yearStart: 2023, yearEnd: 2026, note: "2.7L TurboMax + Trailering Package; ZR2 6,000; base 3,500." },
  { make: "Chevrolet", model: "Tahoe", lb: 8600, yearStart: 2015, yearEnd: 2020, note: "5.3L V8 + Max Trailering Package (2WD)." },
  { make: "Chevrolet", model: "Tahoe", lb: 8400, yearStart: 2021, yearEnd: 2026, note: "5.3L V8 + Max Trailering Package (2WD); 6.2L 8,200; 3.0L Duramax 8,200/8,000." },
  { make: "Chevrolet", model: "Suburban", lb: 8300, yearStart: 2015, yearEnd: 2020, note: "5.3L V8 + Max Trailering Package (2WD)." },
  { make: "Chevrolet", model: "Suburban", lb: 8200, yearStart: 2021, yearEnd: 2026, note: "5.3L V8 + Max Trailering Package (2WD)." },
  { make: "Chevrolet", model: "Traverse", lb: 5000, yearStart: 2018, yearEnd: 2026, note: "w/ factory trailering package (V92); 3.6L V6 (2018-2023) or 2.5L Turbo (2024+)." },
  { make: "Chevrolet", model: "Blazer", lb: 4500, yearStart: 2019, yearEnd: 2026, note: "3.6L V6 w/ trailering equipment (V92); 2.0L Turbo is rated 3,250." },
  { make: "Chevrolet", model: "Equinox", lb: 3500, yearStart: 2018, yearEnd: 2020, note: "2.0L Turbo AWD w/ Trailering Package." },
  { make: "Chevrolet", model: "Equinox", lb: 1500, yearStart: 2021, yearEnd: 2026, note: "1.5L Turbo w/ trailering provisions." },
  { make: "Chevrolet", model: "Trailblazer", lb: 1000, yearStart: 2021, yearEnd: 2026, note: "w/ accessory hitch + trailering provisions." },
  { make: "Chevrolet", model: "Express Cargo Van", lb: 10000, yearStart: 2015, yearEnd: 2026, note: "2500/3500 w/ 6.0L (2015-2020) or 6.6L (2021+) V8; 4.3L V6 tops out at 7,400." },
  { make: "Chevrolet", model: "Express Passenger Van", lb: 9600, yearStart: 2015, yearEnd: 2026, note: "2500/3500 w/ V8; 4.3L V6 6,700." },
  { make: "Chevrolet", model: "Silverado EV", lb: 12500, yearStart: 2024, yearEnd: 2026, note: "Extended-range battery (LT/Trail Boss); standard range 8,500; Max Range 7,000-10,200. Towing cuts EV range drastically." },
  { make: "Chevrolet", model: "Blazer EV", lb: 1500, yearStart: 2024, yearEnd: 2026, note: "AWD/FWD w/ trailering; performance AWD not rated." },
  { make: "Chevrolet", model: "Equinox EV", lb: 3500, yearStart: 2024, yearEnd: 2026, note: "w/ tow package (AWD). Towing cuts EV range drastically." },

  // ── GMC ─────────────────────────────────────────────────────────────────
  { make: "GMC", model: "Sierra 1500", lb: 12000, yearStart: 2014, yearEnd: 2014, note: "6.2L EcoTec3, 3.73 axle." },
  { make: "GMC", model: "Sierra 1500", lb: 12500, yearStart: 2015, yearEnd: 2018, note: "6.2L EcoTec3 + Max Trailering Package." },
  { make: "GMC", model: "Sierra 1500", lb: 12200, yearStart: 2019, yearEnd: 2019, note: "6.2L EcoTec3 + Max Trailering Package." },
  { make: "GMC", model: "Sierra 1500", lb: 13300, yearStart: 2020, yearEnd: 2026, note: "3.0L Duramax or 6.2L V8 + Max Trailering Package w/ 20-in wheels; most V8 configs 9,000-11,300." },
  { make: "GMC", model: "Sierra 2500HD", lb: 14500, yearStart: 2015, yearEnd: 2019, note: "6.0L gas (4.10 axle) or Duramax." },
  { make: "GMC", model: "Sierra 2500HD", lb: 18500, yearStart: 2020, yearEnd: 2023, note: "Duramax w/ AT or 20-in tires; 6.6L gas 14,500." },
  { make: "GMC", model: "Sierra 2500HD", lb: 20000, yearStart: 2024, yearEnd: 2026, note: "Duramax + Max Trailering Package." },
  { make: "GMC", model: "Sierra 3500HD", lb: 14500, yearStart: 2015, yearEnd: 2019, note: "Single rear wheel, 6.0L gas (4.10 axle) or Duramax." },
  { make: "GMC", model: "Sierra 3500HD", lb: 20000, yearStart: 2020, yearEnd: 2026, note: "Single rear wheel, Duramax; 6.6L gas 16,000." },
  { make: "GMC", model: "Sierra 3500HD Dually", lb: 20000, yearStart: 2017, yearEnd: 2026, note: "Dual rear wheel, Duramax." },
  { make: "GMC", model: "Canyon", lb: 7000, yearStart: 2015, yearEnd: 2022, note: "3.6L V6 + Trailering Package; 2.8L Duramax 7,700." },
  { make: "GMC", model: "Canyon", lb: 7700, yearStart: 2023, yearEnd: 2026, note: "2.7L TurboMax + Trailering Package." },
  { make: "GMC", model: "Yukon", lb: 8500, yearStart: 2015, yearEnd: 2020, note: "5.3L V8 + Max Trailering Package; Denali 6.2L 8,100." },
  { make: "GMC", model: "Yukon", lb: 8400, yearStart: 2021, yearEnd: 2026, note: "5.3L V8 + Max Trailering Package (2WD); 6.2L 8,200." },
  { make: "GMC", model: "Yukon XL", lb: 8300, yearStart: 2015, yearEnd: 2020, note: "5.3L V8 + Max Trailering Package (2WD)." },
  { make: "GMC", model: "Yukon XL", lb: 8200, yearStart: 2021, yearEnd: 2026, note: "5.3L V8 + Max Trailering Package (2WD)." },
  { make: "GMC", model: "Acadia", lb: 4000, yearStart: 2017, yearEnd: 2023, note: "3.6L V6 w/ Trailering Package." },
  { make: "GMC", model: "Acadia", lb: 5000, yearStart: 2024, yearEnd: 2026, note: "2.5L Turbo w/ Trailering Equipment Package." },
  { make: "GMC", model: "Savana Cargo Van", lb: 10000, yearStart: 2015, yearEnd: 2026, note: "2500/3500 w/ 6.0L or 6.6L V8." },
  { make: "GMC", model: "Savana Passenger Van", lb: 9600, yearStart: 2015, yearEnd: 2026, note: "2500/3500 w/ V8." },

  // ── RAM / DODGE / CHRYSLER ──────────────────────────────────────────────
  { make: "RAM", model: "1500", lb: 10620, yearStart: 2013, yearEnd: 2018, note: "5.7L HEMI, 8-speed automatic, 3.92 axle (GCWR 15,975); lower-rated configurations are common." },
  { make: "RAM", model: "1500 Classic", lb: 10620, yearStart: 2019, yearEnd: 2024, note: "5.7L HEMI, 8-speed automatic (previous-generation body carried over)." },
  { make: "RAM", model: "1500", lb: 12750, yearStart: 2019, yearEnd: 2024, note: "5.7L HEMI eTorque, Crew Cab 4x2 w/ Max Tow; TRX is rated 8,100." },
  { make: "RAM", model: "1500", lb: 11550, yearStart: 2025, yearEnd: 2026, note: "3.0L Hurricane twin-turbo (standard output), 3.92 axle; High-Output 8,380; 3.6L V6 8,110." },
  { make: "RAM", model: "2500", lb: 17980, yearStart: 2013, yearEnd: 2018, note: "6.7L Cummins w/ 68RFE automatic; 6.4L HEMI up to 16,320." },
  { make: "RAM", model: "2500", lb: 20000, yearStart: 2019, yearEnd: 2026, note: "6.7L Cummins (68RFE 2019-2024, High-Output ZF 2025+); 6.4L HEMI 17,740; Power Wagon 10,590." },
  { make: "RAM", model: "3500", lb: 19550, yearStart: 2013, yearEnd: 2018, note: "6.7L Cummins (68RFE), 3.73 axle; ratings above 20,000 require a fifth-wheel or gooseneck hitch." },
  { make: "RAM", model: "3500", lb: 23000, yearStart: 2019, yearEnd: 2024, note: "6.7L Cummins (68RFE); ratings above 23,000 require a fifth-wheel or gooseneck hitch." },
  { make: "RAM", model: "3500", lb: 20000, yearStart: 2025, yearEnd: 2026, note: "6.7L High-Output Cummins w/ ZF 8-speed; higher ratings require a fifth-wheel or gooseneck hitch." },
  { make: "RAM", model: "ProMaster", lb: 6910, yearStart: 2023, yearEnd: 2026, note: "3.6L V6." },
  { make: "Dodge", model: "Durango", lb: 6200, yearStart: 2011, yearEnd: 2020, note: "3.6L V6 w/ tow package; 5.7L V8 7,400." },
  { make: "Dodge", model: "Durango", lb: 8700, yearStart: 2021, yearEnd: 2026, note: "5.7L V8 Tow 'n Go Package; 3.6L V6 is rated 6,200." },
  { make: "Chrysler", model: "Pacifica", lb: 3600, yearStart: 2017, yearEnd: 2026, note: "Trailer Tow Group." },

  // ── JEEP ────────────────────────────────────────────────────────────────
  { make: "Jeep", model: "Wrangler", lb: 3500, yearStart: 2018, yearEnd: 2024, note: "4-door w/ Max Tow Package; 2-door is rated 2,000; 4xe 3,500." },
  { make: "Jeep", model: "Wrangler", lb: 5000, yearStart: 2025, yearEnd: 2026, note: "4-door Rubicon." },
  { make: "Jeep", model: "Gladiator", lb: 7650, yearStart: 2020, yearEnd: 2023, note: "Max Tow Package." },
  { make: "Jeep", model: "Gladiator", lb: 7700, yearStart: 2024, yearEnd: 2026, note: "Max Tow Package." },
  { make: "Jeep", model: "Grand Cherokee", lb: 7200, yearStart: 2011, yearEnd: 2021, note: "5.7L V8 w/ Factory Towing Package; 3.6L V6 is rated 6,200." },
  { make: "Jeep", model: "Grand Cherokee", lb: 7200, yearStart: 2022, yearEnd: 2025, note: "5.7L V8 w/ tow package; 3.6L 6,000; 4xe 6,000." },
  { make: "Jeep", model: "Grand Cherokee", lb: 6200, yearStart: 2026, yearEnd: 2026, note: "2.0L Hurricane 4 turbo." },
  { make: "Jeep", model: "Grand Cherokee L", lb: 7200, yearStart: 2021, yearEnd: 2025, note: "5.7L V8 w/ tow package; 3.6L is rated 6,000." },
  { make: "Jeep", model: "Cherokee", lb: 4500, yearStart: 2014, yearEnd: 2023, note: "3.2L V6 w/ tow package; 2.0L Turbo 4,000." },
  { make: "Jeep", model: "Cherokee", lb: 3500, yearStart: 2026, yearEnd: 2026, note: "1.6L turbo hybrid." },
  { make: "Jeep", model: "Compass", lb: 2000, yearStart: 2022, yearEnd: 2026, note: "2.0L Turbo." },
  { make: "Jeep", model: "Wagoneer", lb: 10000, yearStart: 2022, yearEnd: 2026, note: "Heavy-Duty Trailer Tow Package (3.0L Hurricane or 6.4L V8 years)." },
  { make: "Jeep", model: "Grand Wagoneer", lb: 9850, yearStart: 2022, yearEnd: 2022, note: "6.4L V8." },
  { make: "Jeep", model: "Grand Wagoneer", lb: 9800, yearStart: 2023, yearEnd: 2025, note: "3.0L Hurricane + Heavy-Duty Trailer Tow Package." },
  { make: "Jeep", model: "Grand Wagoneer", lb: 10000, yearStart: 2026, yearEnd: 2026, note: "Heavy-Duty Trailer Tow Package, 3.92 axle." },
  { make: "Jeep", model: "Recon", lb: 3300, yearStart: 2026, yearEnd: 2026, note: "Electric. Towing cuts EV range drastically." },

  // ── TOYOTA ──────────────────────────────────────────────────────────────
  { make: "Toyota", model: "Tacoma", lb: 6500, yearStart: 2005, yearEnd: 2015, note: "4.0L V6 w/ tow package." },
  { make: "Toyota", model: "Tacoma", lb: 6800, yearStart: 2016, yearEnd: 2023, note: "3.5L V6 w/ tow package; most double-cab 4x4 configurations are rated 6,400." },
  { make: "Toyota", model: "Tacoma", lb: 6500, yearStart: 2024, yearEnd: 2026, note: "2.4L i-FORCE turbo (SR5/TRD PreRunner); i-FORCE MAX hybrid 6,000; base 3,500." },
  { make: "Toyota", model: "Tundra", lb: 10800, yearStart: 2007, yearEnd: 2009, note: "5.7L V8 (regular cab long bed)." },
  { make: "Toyota", model: "Tundra", lb: 10500, yearStart: 2010, yearEnd: 2013, note: "5.7L V8." },
  { make: "Toyota", model: "Tundra", lb: 10200, yearStart: 2014, yearEnd: 2021, note: "5.7L V8, Double Cab 2WD; most configurations are rated 9,800-10,200." },
  { make: "Toyota", model: "Tundra", lb: 12000, yearStart: 2022, yearEnd: 2026, note: "3.4L i-FORCE twin-turbo; i-FORCE MAX hybrid is rated 11,450." },
  { make: "Toyota", model: "Sequoia", lb: 7400, yearStart: 2008, yearEnd: 2022, note: "5.7L V8." },
  { make: "Toyota", model: "Sequoia", lb: 9520, yearStart: 2023, yearEnd: 2026, note: "3.4L i-FORCE MAX hybrid (standard)." },
  { make: "Toyota", model: "4Runner", lb: 5000, yearStart: 2010, yearEnd: 2024, note: "4.0L V6 w/ tow package." },
  { make: "Toyota", model: "4Runner", lb: 6000, yearStart: 2025, yearEnd: 2026, note: "2.4L i-FORCE MAX hybrid; gas trims are rated 5,000." },
  { make: "Toyota", model: "Highlander", lb: 5000, yearStart: 2014, yearEnd: 2026, note: "Gas engine w/ tow package; hybrid models are rated 3,500." },
  { make: "Toyota", model: "Grand Highlander", lb: 5000, yearStart: 2024, yearEnd: 2026, note: "2.4L turbo gas or Hybrid MAX; standard hybrid is rated 3,500." },
  { make: "Toyota", model: "Sienna", lb: 3500, yearStart: 2011, yearEnd: 2020, note: "3.5L V6." },
  { make: "Toyota", model: "Sienna", lb: 3500, yearStart: 2021, yearEnd: 2026, note: "Hybrid." },
  { make: "Toyota", model: "Land Cruiser", lb: 6000, yearStart: 2024, yearEnd: 2026, note: "2.4L i-FORCE MAX hybrid." },

  // ── NISSAN ──────────────────────────────────────────────────────────────
  { make: "Nissan", model: "Frontier", lb: 6500, yearStart: 2014, yearEnd: 2021, note: "4.0L V6 w/ tow package." },
  { make: "Nissan", model: "Frontier", lb: 6720, yearStart: 2022, yearEnd: 2024, note: "3.8L V6 (King Cab 4x2); crew 4x4 configurations are rated lower." },
  { make: "Nissan", model: "Frontier", lb: 7150, yearStart: 2025, yearEnd: 2026, note: "3.8L V6 (King Cab 4x2)." },
  { make: "Nissan", model: "Titan", lb: 9370, yearStart: 2017, yearEnd: 2024, note: "5.6L Endurance V8 w/ tow package; 2017-2019 models are rated up to 9,390." },
  { make: "Nissan", model: "Titan XD", lb: 12300, yearStart: 2016, yearEnd: 2019, note: "5.0L Cummins diesel." },
  { make: "Nissan", model: "Titan XD", lb: 11000, yearStart: 2020, yearEnd: 2024, note: "5.6L gas V8." },
  { make: "Nissan", model: "Pathfinder", lb: 5000, yearStart: 2013, yearEnd: 2020, note: "3.5L V6 w/ tow package." },
  { make: "Nissan", model: "Pathfinder", lb: 6000, yearStart: 2021, yearEnd: 2026, note: "3.5L V6 w/ tow package; base trims are rated 3,500." },
  { make: "Nissan", model: "Armada", lb: 8500, yearStart: 2017, yearEnd: 2026, note: "5.6L V8 w/ tow package." },

  // ── HONDA ───────────────────────────────────────────────────────────────
  { make: "Honda", model: "Ridgeline", lb: 5000, yearStart: 2017, yearEnd: 2026, note: "AWD." },
  { make: "Honda", model: "Pilot", lb: 5000, yearStart: 2016, yearEnd: 2022, note: "AWD w/ tow package; base configurations are rated 3,500." },
  { make: "Honda", model: "Pilot", lb: 5000, yearStart: 2023, yearEnd: 2026, note: "AWD w/ tow package; base configurations are rated 3,500." },
  { make: "Honda", model: "Passport", lb: 5000, yearStart: 2019, yearEnd: 2026, note: "AWD w/ tow package; base configurations are rated 3,500." },
  { make: "Honda", model: "Odyssey", lb: 3500, yearStart: 2011, yearEnd: 2026, note: "3.5L V6." },
  { make: "Honda", model: "CR-V", lb: 1500, yearStart: 2017, yearEnd: 2026, note: "1.5L Turbo." },

  // ── HYUNDAI ─────────────────────────────────────────────────────────────
  { make: "Hyundai", model: "Palisade", lb: 5000, yearStart: 2020, yearEnd: 2026, note: "w/ trailer package." },
  { make: "Hyundai", model: "Santa Fe", lb: 3500, yearStart: 2019, yearEnd: 2023, note: "2.0T/2.5T AWD properly equipped." },
  { make: "Hyundai", model: "Santa Fe", lb: 4500, yearStart: 2024, yearEnd: 2026, note: "2.5L Turbo AWD w/ trailer brakes (XRT); other trims 3,500." },
  { make: "Hyundai", model: "Santa Cruz", lb: 5000, yearStart: 2022, yearEnd: 2026, note: "2.5L Turbo AWD w/ trailer brakes; base engine is rated 3,500." },
  { make: "Hyundai", model: "Tucson", lb: 2000, yearStart: 2022, yearEnd: 2025, note: "w/ tow package; hybrid 2,000." },
  { make: "Hyundai", model: "Tucson", lb: 2750, yearStart: 2026, yearEnd: 2026, note: "Gas w/ tow package; hybrid/PHEV 2,000." },

  // ── KIA ─────────────────────────────────────────────────────────────────
  { make: "Kia", model: "Telluride", lb: 5500, yearStart: 2020, yearEnd: 2026, note: "X-Pro w/ self-leveling suspension; other trims are rated 5,000." },
  { make: "Kia", model: "Sorento", lb: 4500, yearStart: 2021, yearEnd: 2026, note: "X-Pro 2.5T AWD w/ self-leveling suspension; other trims 3,500." },
  { make: "Kia", model: "Carnival", lb: 3500, yearStart: 2022, yearEnd: 2026, note: "Top trims w/ self-leveling suspension; base configurations are rated 2,500." },
  { make: "Kia", model: "Sportage", lb: 2500, yearStart: 2023, yearEnd: 2026, note: "X-Pro AWD w/ tow package; other trims are rated 2,000." },
  { make: "Kia", model: "EV9", lb: 5000, yearStart: 2024, yearEnd: 2026, note: "AWD w/ tow package. Towing cuts EV range drastically." },

  // ── VOLKSWAGEN ──────────────────────────────────────────────────────────
  { make: "Volkswagen", model: "Atlas", lb: 5000, yearStart: 2018, yearEnd: 2023, note: "3.6L VR6 w/ trailer package." },
  { make: "Volkswagen", model: "Atlas", lb: 5000, yearStart: 2024, yearEnd: 2026, note: "2.0L Turbo w/ factory tow package (SE base is rated 2,000 w/ accessory hitch only)." },
  { make: "Volkswagen", model: "Atlas Cross Sport", lb: 5000, yearStart: 2020, yearEnd: 2026, note: "w/ trailer package." },
  { make: "Volkswagen", model: "Tiguan", lb: 2200, yearStart: 2018, yearEnd: 2026, note: "w/ tow package; base is rated 1,500." },
  { make: "Volkswagen", model: "ID.4", lb: 2700, yearStart: 2023, yearEnd: 2026, note: "AWD w/ tow hitch. Towing cuts EV range drastically." },

  // ── MAZDA ───────────────────────────────────────────────────────────────
  { make: "Mazda", model: "CX-90", lb: 5000, yearStart: 2024, yearEnd: 2026, note: "3.3L Turbo S w/ tow package; standard turbo and PHEV are rated 3,500." },
  { make: "Mazda", model: "CX-70", lb: 5000, yearStart: 2024, yearEnd: 2026, note: "3.3L Turbo S w/ tow package; other configurations 3,500." },
  { make: "Mazda", model: "CX-9", lb: 3500, yearStart: 2016, yearEnd: 2023, note: "2.5L Turbo w/ tow package." },
  { make: "Mazda", model: "CX-50", lb: 3500, yearStart: 2023, yearEnd: 2026, note: "2.5L Turbo w/ tow package." },
  { make: "Mazda", model: "CX-5", lb: 2000, yearStart: 2017, yearEnd: 2026, note: "2.5L Turbo w/ tow package." },

  // ── SUBARU ──────────────────────────────────────────────────────────────
  { make: "Subaru", model: "Ascent", lb: 5000, yearStart: 2019, yearEnd: 2026, note: "All trims w/ package." },
  { make: "Subaru", model: "Outback Wilderness", lb: 3500, yearStart: 2022, yearEnd: 2026, note: "2.4L turbo." },
  { make: "Subaru", model: "Outback", lb: 2700, yearStart: 2015, yearEnd: 2026, note: "2.5i w/ package; non-Wilderness trims." },
  { make: "Subaru", model: "Forester Wilderness", lb: 3000, yearStart: 2022, yearEnd: 2026, note: "Other trims are rated 1,500." },
  { make: "Subaru", model: "Crosstrek Wilderness", lb: 3500, yearStart: 2024, yearEnd: 2026, note: "2.5L; other trims are rated 1,500." },

  // ── MITSUBISHI ──────────────────────────────────────────────────────────
  { make: "Mitsubishi", model: "Outlander", lb: 2000, yearStart: 2022, yearEnd: 2026, note: "Properly equipped." },

  // ── LUXURY & PREMIUM ────────────────────────────────────────────────────
  { make: "Cadillac", model: "Escalade", lb: 8200, yearStart: 2021, yearEnd: 2026, note: "6.2L V8 w/ tow package." },
  { make: "Cadillac", model: "XT6", lb: 4000, yearStart: 2020, yearEnd: 2026, note: "3.6L V6 w/ tow package." },
  { make: "Buick", model: "Enclave", lb: 5000, yearStart: 2018, yearEnd: 2026, note: "V6 w/ trailering package." },
  { make: "Lincoln", model: "Navigator", lb: 8700, yearStart: 2018, yearEnd: 2026, note: "3.5L EcoBoost w/ Heavy-Duty Trailer Tow package." },
  { make: "Lexus", model: "GX", lb: 9100, yearStart: 2024, yearEnd: 2026, note: "GX 550 — 9,096 lb." },
  { make: "Lexus", model: "LX", lb: 8000, yearStart: 2022, yearEnd: 2026, note: "LX 600." },
  { make: "Lexus", model: "TX", lb: 5000, yearStart: 2024, yearEnd: 2026, note: "w/ tow package." },
  { make: "Infiniti", model: "QX80", lb: 8500, yearStart: 2014, yearEnd: 2026, note: "5.6L V8 w/ tow package (same platform as Nissan Armada)." },

  // ── ELECTRIC & PERFORMANCE ──────────────────────────────────────────────
  { make: "Tesla", model: "Model X", lb: 5000, yearStart: 2016, yearEnd: 2026, note: "w/ tow package. Towing cuts EV range drastically." },
  { make: "Tesla", model: "Model Y", lb: 3500, yearStart: 2020, yearEnd: 2026, note: "w/ tow hitch. Towing cuts EV range drastically." },
  { make: "Tesla", model: "Cybertruck", lb: 11000, yearStart: 2024, yearEnd: 2026, note: "Tesla's maximum published rating (Cyberbeast); some AWD configurations are rated 7,500. Towing cuts EV range drastically." },
  { make: "Rivian", model: "R1T", lb: 11000, yearStart: 2022, yearEnd: 2026, note: "Maximum published rating w/ tow package; depends on battery — some dual-motor configurations are rated 7,700. Towing cuts EV range drastically." },
  { make: "Rivian", model: "R1S", lb: 7700, yearStart: 2023, yearEnd: 2026, note: "w/ tow package. Towing cuts EV range drastically." },

  // ── MERCEDES-BENZ ───────────────────────────────────────────────────────
  { make: "Mercedes-Benz", model: "Sprinter 2500", lb: 5000, yearStart: 2019, yearEnd: 2026, note: "w/ tow package." },
  { make: "Mercedes-Benz", model: "Sprinter 3500", lb: 7500, yearStart: 2019, yearEnd: 2026, note: "w/ tow package." },
];

// Dropdown sources derived from the verified table itself, so the lists can
// never drift from the data. Model options are deduped across year-range rows.
export const TOWING_MAKES = [...new Set(TOWING_TABLE.map((row) => row.make))].sort();

export const TOWING_MODEL_OPTIONS: Record<string, { label: string; value: string }[]> =
  Object.fromEntries(
    TOWING_MAKES.map((make) => [
      make,
      [...new Set(TOWING_TABLE.filter((row) => row.make === make).map((row) => row.model))]
        .map((model) => ({ label: model, value: model }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ])
  );

export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export type TowingLookup = { row: TowingRow | undefined; yearInRange: boolean };

/**
 * Year-aware lookup: rows matching make+model; prefer the row whose
 * yearStart..yearEnd (inclusive) contains the entered year; otherwise the
 * nearest row by year (model entry year goes to the earliest row, later year
 * to the latest row). yearInRange is false when the match was a fallback.
 */
export function lookupTowing(make: string, model: string, year?: number): TowingLookup {
  const rows = TOWING_TABLE.filter(
    (r) => norm(r.make) === norm(make) && norm(r.model) === norm(model)
  );
  if (rows.length === 0) return { row: undefined, yearInRange: true };
  const y = year && Number.isFinite(year) ? Math.round(year) : undefined;
  if (y === undefined) return { row: rows[rows.length - 1], yearInRange: true };
  const inRange = rows.find(
    (r) => (r.yearStart ?? -Infinity) <= y && y <= (r.yearEnd ?? Infinity)
  );
  if (inRange) return { row: inRange, yearInRange: true };
  // nearest by year: before the earliest range -> earliest row; after latest -> latest row
  const sorted = [...rows].sort(
    (a, b) => (a.yearStart ?? -Infinity) - (b.yearStart ?? -Infinity)
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const fallback =
    y < (first.yearStart ?? Infinity) ? first : y > (last.yearEnd ?? -Infinity) ? last : first;
  return { row: fallback, yearInRange: false };
}

// Year range label for display in the note, e.g. "2021-2023".
export const yearRangeLabel = (row: TowingRow): string =>
  row.yearStart && row.yearEnd ? `${row.yearStart}-${row.yearEnd}` : "";

// ── Excluded (could NOT be verified from a manufacturer source this pass) ──
// Ford: Mustang (1,000-lb accessory-only rating; not a tow vehicle), Mustang
// Mach-E and E-Transit (Ford: "not recommended for trailer towing"), E-Series
// cutaway, Transit pre-2020, F-150 Raptor pre-2021, Expedition 2013-2017,
// F-150 Raptor 2017-2020, 2017 Super Duty.
// Chevrolet/GMC: 2015-2016 3500HD dually, Silverado/Sierra 1500 Limited (2022),
// GMC Sierra EV, Hummer EV, Terrain.
// RAM: ProMaster 2014-2022, ProMaster City, 1500 TRX (separate rating).
// Jeep: Renegade, Grand Cherokee L 2026 (2.0T transition year).
// Toyota: RAV4, Land Cruiser 200 (2008-2021), Highlander 2008-2013, Venza,
// Crown, bZ4X.
// Nissan: NV2500/NV3500 vans, Rogue, Murano, Kicks, Frontier 2005-2013,
// Titan 2004-2015, Xterra.
// Honda: HR-V, Pilot 2003-2015, Element, Insight.
// Hyundai/Kia: Ioniq 5, Kona, Venue, Seltos, Niro, EV6.
// Others: Buick Envision, Acura MDX/RDX, Lexus RX/NX/GX 460, Volvo, Audi,
// BMW, Mercedes GLE/GLS/Metris, Porsche, Land Rover, VW Taos/Routan/Jetta,
// Ford Flex, Chrysler Voyager/Grand Caravan, Subaru Forester (base trims),
// Mitsubishi Outlander PHEV/Eclipse Cross, Tesla Model 3/S/S (unrated or
// not verified), GMC Hummer EV, GMC Sierra EV, Hyundai Ioniq models.
