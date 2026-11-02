/**
 * 아반떼 견적 화면용 데이터와 참고용 시장요율 모델.
 * 차량 기본가격: 현대자동차 디 올 뉴 아반떼 가솔린 2.0
 * 공식 가격표(2026-10-01 기준, 기본 트림 가격).
 *
 * 2026-11-02 공개 비교 견적 참고 (개별 상품·보험 조건은 서로 다름):
 * - 오토사인: 2027 모던, 48개월, 2만km, 초기비용 없음, 약 366,800원/월
 * - 차콕: 2027 아반떼, 48개월, 초기비용 없음, 약 355,490원/월
 * 실계약/확정가가 아니며 렌터사 요율 API 연결 시 반드시 교체해야 합니다.
 */

export const trimOptions = [
  { id: "modern", name: "모던", price: 23_980_000 },
  { id: "premium", name: "프리미엄", price: 27_710_000 },
  { id: "inspiration", name: "인스퍼레이션", price: 31_520_000 },
] as const;

export const colorOptions = [
  { id: "copper", name: "고요 카퍼 펄", hex: "#9b8c7e", image: "/avante/colors/copper.webp", price: 0 },
  { id: "gray", name: "에코트로닉 그레이 펄", hex: "#6d7373", image: "/avante/colors/gray.webp", price: 0 },
  { id: "black", name: "어비스 블랙 펄", hex: "#242628", image: "/avante/colors/black.webp", price: 0 },
  { id: "red", name: "볼케닉 레드 펄", hex: "#bb3d31", image: "/avante/colors/red.webp", price: 0 },
  { id: "white", name: "아틀라스 화이트", hex: "#f5f5f0", image: "/avante/colors/white.webp", price: 100_000 },
  { id: "green", name: "그라펜 그린 펄", hex: "#3e5851", image: "/avante/colors/green.webp", price: 0 },
  { id: "silver", name: "퀀텀 실버 펄", hex: "#b3b7ba", image: "/avante/colors/silver.webp", price: 0 },
] as const;

export type TrimId = (typeof trimOptions)[number]["id"];
export type ColorId = (typeof colorOptions)[number]["id"];
export type ContractMonths = 36 | 48 | 60;
export type AnnualMileage = 10000 | 15000 | 20000 | 30000 | "unlimited";
export type PaymentPercent = 0 | 10 | 20 | 30;

export type RentalSelection = {
  trim: TrimId;
  color: ColorId;
  months: ContractMonths;
  mileage: AnnualMileage;
  advance: PaymentPercent;
  deposit: PaymentPercent;
};

export const defaultRentalSelection: RentalSelection = {
  trim: "modern",
  color: "copper",
  months: 48,
  mileage: 15000,
  advance: 0,
  deposit: 0,
};

export const formatWon = (amount: number) => Math.round(amount).toLocaleString("ko-KR");

export function formatMileage(mileage: AnnualMileage) {
  if (mileage === "unlimited") return "무제한";
  return `${mileage === 10000 ? "1만" : mileage === 15000 ? "1.5만" : mileage === 20000 ? "2만" : "3만"} km`;
}

export function estimateMonthlyRent(selection: RentalSelection) {
  const selectedTrim = trimOptions.find((trim) => trim.id === selection.trim) ?? trimOptions[0];
  const selectedColor = colorOptions.find((color) => color.id === selection.color) ?? colorOptions[0];
  const vehiclePrice = selectedTrim.price + selectedColor.price;

  // 견적 업체에서 공개한 월 렌트료를 참고한 '시장 기준' 예시값.
  // 48개월·모던·1.5만km·선납/보증금 0%를 약 355,000원으로 설정.
  // 다른 기간과 주행거리의 차액은 화면 시뮬레이션용 가정입니다.
  const baseMonthlyByTerm: Record<ContractMonths, number> = {
    36: 405000, 48: 355000, 60: 350000,
  };
  const mileageAdjustment: Record<Exclude<AnnualMileage, "unlimited">, number> = {
    10000: -12000, 15000: 0, 20000: 12000, 30000: 38000,
  };
  const trimAndColorAdjustment = (vehiclePrice - trimOptions[0].price) * 0.0145;
  const advanceMonthly = vehiclePrice * (selection.advance / 100) / selection.months;
  // 보증금 할인율(연 3.5%) 역시 임시 가정이며 실제 렌터사 요율과 다릅니다.
  const depositDiscount = vehiclePrice * (selection.deposit / 100) * 0.035 / 12;
  const estimated = selection.mileage === "unlimited"
    ? null
    : baseMonthlyByTerm[selection.months] + trimAndColorAdjustment
      + mileageAdjustment[selection.mileage] - advanceMonthly - depositDiscount;

  return {
    vehiclePrice,
    // 무제한 주행은 제공 여부와 요율이 렌터사마다 달라 임의의 숫자를 표시하지 않습니다.
    monthlyRent: estimated === null ? null : Math.round(Math.max(100000, estimated) / 100) * 100,
    advanceAmount: Math.round(vehiclePrice * selection.advance / 100),
    depositAmount: Math.round(vehiclePrice * selection.deposit / 100),
  };
}
