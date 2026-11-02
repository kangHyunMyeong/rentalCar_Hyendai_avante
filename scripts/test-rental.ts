import assert from "node:assert/strict";
import { colorOptions, defaultRentalSelection, estimateMonthlyRent, trimOptions, type RentalSelection } from "../src/rental-data";

function estimate(changes: Partial<RentalSelection> = {}) {
  return estimateMonthlyRent({ ...defaultRentalSelection, ...changes });
}

assert.equal(trimOptions.length, 3, "트림 3개 유지");
assert.equal(colorOptions.length, 7, "컬러 옵션 7개 유지");
assert.equal(estimate().monthlyRent, 355000, "기본 조건의 예상 월 렌트료");
assert.equal(estimate({ mileage: 10000 }).monthlyRent, 343000);
assert.equal(estimate({ mileage: 20000 }).monthlyRent, 367000);
assert.equal(estimate({ mileage: 30000 }).monthlyRent, 393000);
assert.equal(estimate({ mileage: "unlimited" }).monthlyRent, null, "무제한 주행은 별도 상담");
assert.equal(estimate({ months: 36 }).monthlyRent, 405000);
assert.equal(estimate({ months: 60 }).monthlyRent, 350000);
assert.ok((estimate({ trim: "premium" }).monthlyRent ?? 0) > (estimate().monthlyRent ?? 0));
assert.ok((estimate({ color: "white" }).monthlyRent ?? 0) > (estimate().monthlyRent ?? 0));
assert.ok((estimate({ deposit: 10 }).monthlyRent ?? Infinity) < (estimate().monthlyRent ?? 0));
assert.ok((estimate({ advance: 10 }).monthlyRent ?? Infinity) < (estimate().monthlyRent ?? 0));
assert.equal(estimate({ advance: 10 }).advanceAmount, 2398000);
assert.equal(estimate({ deposit: 20 }).depositAmount, 4796000);
assert.equal((estimate({ color: "white" }).monthlyRent ?? 0) % 100, 0, "월 렌트료 100원 단위 반올림");
console.log("견적 계산 검증 통과 (기본값·기간·주행거리·색상·트림·선납/보증금·반올림)");
