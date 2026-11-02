import { useEffect, useRef, useState, type FormEvent } from "react";
import Lenis from "lenis";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronDown, RotateCcw, ShieldCheck, Wallet, X } from "lucide-react";
import { colorOptions, defaultRentalSelection, estimateMonthlyRent, formatMileage, formatWon, trimOptions, type AnnualMileage, type ContractMonths, type PaymentPercent, type RentalSelection } from "./rental-data";

const featureHighlights = [
  { image: "/avante/avante-08.webp", alt: "아반떼 실내 중앙 디스플레이와 운전석", label: "DISPLAY", title: "필요한 정보를 한눈에", detail: "가운데 화면에서 길 안내와 주요 정보를 편리하게 확인하세요." },
  { image: "/avante/avante-10.webp", alt: "주행 중 사용할 수 있는 버튼이 있는 아반떼 스티어링 휠", label: "STEERING", title: "핸들에서 간편하게", detail: "자주 쓰는 기능을 핸들 버튼으로 편리하게 조작할 수 있어요." },
  { image: "/avante/avante-12.webp", alt: "아반떼 전동식 주차 브레이크 버튼", label: "PARKING", title: "주차 브레이크도 버튼으로", detail: "주차 브레이크를 버튼으로 간편하게 작동할 수 있어요." },
];

const monthOptions: ContractMonths[] = [36, 48, 60];
const mileageOptions: AnnualMileage[] = [10000, 15000, 20000, 30000, "unlimited"];
const paymentOptions: PaymentPercent[] = [0, 10, 20, 30];

type LegalId = "privacy" | "terms";

const legalDocuments: Record<LegalId, { title: string; updated: string; sections: { heading: string; body: string[] }[] }> = {
  privacy: {
    title: "개인정보처리방침",
    updated: "2026년 11월 2일",
    sections: [
      { heading: "1. 기본 원칙", body: ["핏카컴퍼니(이하 “회사”)는 아반떼 장기렌트 안내 페이지에서 개인정보 보호법 등 관련 법령을 따르며, 이용자의 개인정보를 상담에 필요한 범위에서만 처리합니다."] },
      { heading: "2. 수집하는 항목", body: ["상담 신청 시 고객명, 연락처, 문의 내용(선택), 선택한 트림·색상·계약기간·주행거리·선납금·보증금 조건을 처리 대상으로 합니다.", "이 페이지는 이용자를 식별하는 분석 도구나 광고 쿠키를 사용하지 않습니다."] },
      { heading: "3. 이용 목적", body: ["수집한 정보는 아반떼 장기렌트 예상 견적 안내와 상담 연락에만 사용합니다."] },
      { heading: "4. 보유 및 파기", body: ["상담 목적이 달성되면 지체 없이 파기합니다. 관계 법령에서 일정 기간 보관을 요구하는 경우에는 그 기간 동안만 보관합니다.", "현재 상담 접수 기능은 준비 중입니다. 화면에 입력한 정보는 서버에 저장되거나 전송되지 않습니다."] },
      { heading: "5. 제3자 제공과 처리 위탁", body: ["회사는 이용자의 개인정보를 제3자에게 제공하거나 외부에 처리를 위탁하지 않습니다.", "실제 렌트 계약을 진행하면서 렌터사 등에 정보가 필요한 경우에는 제공받는 자, 목적, 항목, 보유 기간을 알리고 별도 동의를 받습니다."] },
      { heading: "6. 이용자의 권리", body: ["이용자는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.", "동의를 거부할 수 있으며, 필수 항목에 대한 동의를 거부하면 상담 신청을 진행할 수 없습니다."] },
      { heading: "7. 문의처", body: ["개인정보 관련 문의는 아래로 연락해 주세요.", "상호 핏카컴퍼니 · 대표자 김민철 · 사업자등록번호 578-36-01253", "주소 인천광역시 서구 파랑로 495 에이스하이테크시티 1동 1004호"] },
    ],
  },
  terms: {
    title: "이용약관",
    updated: "2026년 11월 2일",
    sections: [
      { heading: "1. 목적", body: ["이 약관은 핏카컴퍼니가 제공하는 아반떼 장기렌트 안내 페이지의 이용 조건과 회사와 이용자 사이의 권리, 의무를 정합니다."] },
      { heading: "2. 서비스 내용", body: ["이용자는 트림, 색상, 계약기간, 주행거리, 선납금, 보증금을 선택해 예상 월 렌트료를 확인할 수 있습니다.", "상담 신청 화면에서 연락 정보를 남길 수 있으나, 현재는 접수 기능을 준비 중이며 입력한 정보는 서버에 저장되거나 전송되지 않습니다."] },
      { heading: "3. 예상 견적", body: ["화면에 표시되는 월 렌트료는 참고용 예상 금액입니다. 렌터사 요율, 보험·정비 조건, 심사 결과, 프로모션에 따라 실제 금액은 달라질 수 있습니다.", "차량 계약은 이 페이지의 예상 금액만으로 성립하지 않으며, 별도의 상담과 계약 절차를 거쳐 확정됩니다."] },
      { heading: "4. 이용자의 의무", body: ["이용자는 본인의 정확한 정보를 입력해야 하며, 타인의 정보를 도용하거나 페이지 운영을 방해해서는 안 됩니다."] },
      { heading: "5. 지식재산권", body: ["페이지의 구성과 문구에 대한 권리는 회사에 있습니다. 차량 이미지는 현대자동차 공식 홈페이지를 출처로 합니다."] },
      { heading: "6. 책임의 한계", body: ["회사는 예상 견적과 실제 계약 조건의 차이, 이용자의 네트워크 환경, 천재지변 등 회사의 합리적 통제를 벗어난 사유로 발생한 손해에 대해 책임을 지지 않습니다."] },
      { heading: "7. 약관의 변경과 준거법", body: ["회사는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 페이지에 게시합니다.", "이 약관은 대한민국 법령을 따르며, 분쟁이 발생하면 민사소송법에 따른 관할 법원에 제소합니다."] },
    ],
  },
};

export const faqItems = [
  { question: "화면의 예상 월 렌트료가 최종 가격인가요?", answer: "아니요. 화면에 표시된 금액은 참고용 예상금액입니다. 실제 월 렌트료는 렌터사 요율, 보험 조건, 심사 결과 등에 따라 달라질 수 있습니다." },
  { question: "월 렌트료에 보험료와 자동차세가 포함되나요?", answer: "일반적인 장기렌트 상품에는 보험료와 자동차세가 포함되는 경우가 많습니다. 정확한 포함 항목과 보험 보장 범위는 계약 전에 확인해 주세요." },
  { question: "선납금과 보증금은 무엇이 다른가요?", answer: "선납금은 렌트료를 미리 내는 돈으로, 계약이 끝나도 돌려받지 않습니다. 보증금은 계약 조건에 따라 계약 종료 시 돌려받을 수 있는 돈입니다." },
  { question: "보증금 없이도 장기렌트가 가능한가요?", answer: "무보증 조건으로 상담할 수 있습니다. 다만 이용 가능 여부는 렌터사와 심사 결과에 따라 달라질 수 있습니다." },
  { question: "계약기간과 주행거리는 어떻게 선택하나요?", answer: "차를 몇 년 동안 이용할지, 1년에 얼마나 운전할지 생각해 보세요. 선택한 기간과 주행거리에 따라 월 렌트료가 달라집니다." },
  { question: "약정한 주행거리를 넘으면 어떻게 되나요?", answer: "차량 반납 시 약정 주행거리를 초과하면 추가 비용이 발생할 수 있습니다. 평소 운전하는 거리를 고려해 선택하는 것이 좋습니다." },
  { question: "계약이 끝나면 차를 인수하거나 반납할 수 있나요?", answer: "상품에 따라 차량 인수 또는 반납을 선택할 수 있습니다. 만기 선택 가능 여부와 인수 비용은 계약 전에 확인해 주세요." },
  { question: "계약 중간에 해지하면 비용이 발생하나요?", answer: "네, 계약 조건에 따라 중도해지 수수료가 발생할 수 있습니다. 예상 이용기간에 맞는 계약기간을 선택해 주세요." },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [rental, setRental] = useState<RentalSelection>(defaultRentalSelection);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [consultOpen, setConsultOpen] = useState(false);
  const [consultName, setConsultName] = useState("");
  const [consultPhone, setConsultPhone] = useState("");
  const [consultMessage, setConsultMessage] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const [consultError, setConsultError] = useState("");
  const [consultReviewed, setConsultReviewed] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [legalOpen, setLegalOpen] = useState<LegalId | null>(null);
  const consultDialogRef = useRef<HTMLDialogElement>(null);
  const legalDialogRef = useRef<HTMLDialogElement>(null);
  const featureScrollRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const activeColor = colorOptions.find((color) => color.id === rental.color) ?? colorOptions[0];
  const activeTrim = trimOptions.find((trim) => trim.id === rental.trim) ?? trimOptions[0];
  const estimate = estimateMonthlyRent(rental);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      smoothWheel: true,
      lerp: 0.09,
      syncTouch: false,
      prevent: (node) => Boolean(node.closest("dialog[open]")),
    });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 88);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(".scroll-reveal");
    if (!("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dialog = consultDialogRef.current;
    if (!dialog) return;
    if (consultOpen && !dialog.open) dialog.showModal();
    if (!consultOpen && dialog.open) dialog.close();
  }, [consultOpen]);

  useEffect(() => {
    const dialog = legalDialogRef.current;
    if (!dialog) return;
    if (legalOpen && !dialog.open) {
      dialog.showModal();
      dialog.scrollTop = 0;
    }
    if (!legalOpen && dialog.open) dialog.close();
  }, [legalOpen]);

  useEffect(() => {
    if (consultOpen || legalOpen) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [consultOpen, legalOpen]);

  const openConsultation = () => {
    setConsultName("");
    setConsultPhone("");
    setConsultMessage("");
    setPrivacyAgreed(false);
    setPrivacyExpanded(false);
    setConsultError("");
    setConsultReviewed(false);
    setConsultOpen(true);
  };

  const submitConsultation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digits = consultPhone.replace(/\D/g, "");
    if (consultName.trim().length < 2) return setConsultError("고객명을 두 글자 이상 입력해 주세요.");
    if (!/^01[016789]\d{7,8}$/.test(digits)) return setConsultError("연락처를 정확히 입력해 주세요.");
    if (!privacyAgreed) return setConsultError("개인정보 수집·이용 동의를 확인해 주세요.");
    setConsultError("");
    // 실제 접수 API가 연결되기 전까지 입력값은 저장하거나 전송하지 않습니다.
    setConsultReviewed(true);
  };

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
  };

  const handleNavigation = (label: string) => {
    const targetId = label === "주요 기능" ? "features" : label === "컬러 · 견적" ? "estimate" : label === "장기렌트 장점" ? "benefits" : label === "FAQ" ? "faq" : null;
    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        if (lenisRef.current) lenisRef.current.scrollTo(target);
        else target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
  };

  const scrollToTop = () => {
    if (lenisRef.current) lenisRef.current.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateRental = <K extends keyof RentalSelection>(key: K, value: RentalSelection[K]) => {
    setRental((previous) => ({ ...previous, [key]: value }));
  };

  const scrollToFeature = (index: number) => {
    const container = featureScrollRef.current;
    if (!container) return;
    const card = container.querySelectorAll<HTMLElement>(".features-card")[index];
    if (!card) return;
    const left = container.scrollLeft + card.getBoundingClientRect().left - container.getBoundingClientRect().left;
    container.scrollTo({ left, behavior: "smooth" });
    setFeatureIndex(index);
  };

  const scrollFeatures = (direction: -1 | 1) => {
    scrollToFeature(Math.max(0, Math.min(featureHighlights.length - 1, featureIndex + direction)));
  };

  const onFeatureScroll = () => {
    const container = featureScrollRef.current;
    if (!container) return;
    const start = container.getBoundingClientRect().left;
    const cards = [...container.querySelectorAll<HTMLElement>(".features-card")];
    if (!cards.length) return;
    const nearest = cards.reduce((best, card, index) => {
      return Math.abs(card.getBoundingClientRect().left - start) < Math.abs(cards[best].getBoundingClientRect().left - start) ? index : best;
    }, 0);
    setFeatureIndex(nearest);
  };

  return (
    <main className="landing-shell">
      <div className="landing-container">
        <div className="landing-content">
          <header className={`fitcar-header ${scrolled ? "is-scrolled" : ""}`}>
            <button type="button" className="fitcar-logo" onClick={scrollToTop} aria-label="핏카 아반떼 상단 이동">
              <span className="logo-main">FITCAR<span className="logo-period">.</span></span>
              <span className="logo-sub">THE ALL-NEW AVANTE</span>
            </button>
            <div className="header-buttons">
              <button type="button" className="header-cta" onClick={openConsultation}><span>무료 견적 상담</span><ArrowRight size={17} strokeWidth={1.8} /></button>
            </div>
          </header>

          <section className="hero-section" id="hero" aria-label="디 올 뉴 아반떼 장기렌트 메인 비주얼">
            <div className="hero-layout">
              <div className="hero-copy">
                <h1>매일 타는 아반떼,<br/>장기렌트로<br/><em>편하게 시작하세요.</em></h1>
                <p>원하는 트림과 색상을 고르고,<br/>계약기간과 주행거리에 따른 예상 렌트료를 확인해 보세요.</p>
                <div className="hero-actions">
                  <button type="button" className="hero-primary" onClick={() => handleNavigation("컬러 · 견적")}>무료 견적 알아보기 <ArrowRight size={18} strokeWidth={1.8}/></button>
                </div>
              </div>
              <div className="hero-visual">
                <img src="/avante/avante-04.webp" alt="건축적 공간 앞에 놓인 디 올 뉴 아반떼 차량" width={1280} height={540} fetchPriority="high" />
              </div>
            </div>
          </section>

          <section className="avante-features" id="features" aria-labelledby="features-title">
            <div className="features-heading scroll-reveal">
              <div>
                <span className="explore-label">AVANTE FEATURES</span>
                <h2 id="features-title">매일 쓰는 기능,<br/><em>더 편리하게.</em></h2>
              </div>
              <p>운전할 때 자주 사용하는 기능을<br/>사진으로 간편하게 살펴보세요.</p>
            </div>

            <div className="features-showcase scroll-reveal" ref={featureScrollRef} onScroll={onFeatureScroll} aria-label="아반떼 주요 기능 사진 슬라이더">
              <article className="features-card features-card-primary">
                <div className="features-picture"><img src={featureHighlights[0].image} alt={featureHighlights[0].alt} width={1280} height={720} loading="lazy" /></div>
                <div className="features-card-copy">
                  <span>01 / {featureHighlights[0].label}</span>
                  <h3>{featureHighlights[0].title}</h3>
                  <p>{featureHighlights[0].detail}</p>
                </div>
              </article>
              <div className="features-side">
                {featureHighlights.slice(1).map((feature, index) => (
                  <article className="features-card features-card-secondary" key={feature.image}>
                    <div className="features-picture"><img src={feature.image} alt={feature.alt} width={1280} height={579} loading="lazy" /></div>
                    <div className="features-card-copy">
                      <span>{String(index + 2).padStart(2, "0")} / {feature.label}</span>
                      <h3>{feature.title}</h3>
                      <p>{feature.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="features-mobile-controls" aria-label="기능 사진 슬라이드 조작">
              <div className="features-dots">
                {featureHighlights.map((feature,index) => <button key={feature.image} type="button" aria-label={`${index + 1}번째 기능 보기: ${feature.title}`} aria-current={featureIndex === index ? "true" : undefined} onClick={() => scrollToFeature(index)}/>)}
              </div>
              <div className="features-arrows">
                <button type="button" aria-label="이전 기능" disabled={featureIndex === 0} onClick={() => scrollFeatures(-1)}><ArrowLeft size={18}/></button>
                <span>{String(featureIndex + 1).padStart(2, "0")} / 03</span>
                <button type="button" aria-label="다음 기능" disabled={featureIndex === 2} onClick={() => scrollFeatures(1)}><ArrowRight size={18}/></button>
              </div>
            </div>
            <div className="features-bottom scroll-reveal">
              <p>※ 사진 속 기능은 트림 및 선택 옵션에 따라 다를 수 있습니다.</p>
            </div>
          </section>

          <section className="rental-estimate-section" id="estimate" aria-labelledby="rental-estimate-title">
            <div className="estimate-section-heading scroll-reveal">
              <span className="explore-label">COLOR &amp; RENTAL ESTIMATE</span>
              <h2 id="rental-estimate-title">내가 고른 아반떼,<br/><em>렌트료는 얼마일까요?</em></h2>
              <p>원하는 색상과 트림을 고르고, 이용할 기간과 주행거리를 선택해 보세요.<br/>예상 월 렌트료를 바로 확인할 수 있어요.</p>
            </div>

            <div className="rental-estimate-grid scroll-reveal">
              <div className="rental-color-panel">
                <div className="rental-color-top"><span>01 / 차량 컬러</span><span>7가지 외장 컬러</span></div>
                <div className="rental-car-stage">
                  <img key={activeColor.id} src={activeColor.image} alt={`${activeColor.name} 색상의 디 올 뉴 아반떼 차량`} />
                  <div className="rental-car-stage-caption">THE ALL-NEW AVANTE <span>GASOLINE 2.0</span></div>
                </div>
                <div className="rental-color-picker">
                  <div className="rental-color-name"><div><span>선택한 외장 컬러</span><strong>{activeColor.name}</strong></div><small>{activeColor.price > 0 ? `+${formatWon(activeColor.price)}원` : "추가금 없음"}</small></div>
                  <div className="rental-swatches" role="group" aria-label="외장 컬러 선택">
                    {colorOptions.map((color) => (
                      <button key={color.id} type="button" className={`rental-swatch ${rental.color === color.id ? "selected" : ""}`} onClick={() => updateRental("color", color.id)} aria-label={`${color.name}${color.price ? `, 추가금 ${formatWon(color.price)}원` : ""}`} aria-pressed={rental.color === color.id} title={color.name}>
                        <span style={{ backgroundColor: color.hex }} />
                      </button>
                    ))}
                  </div>
                  <p className="rental-color-help">색상을 누르면 차량 이미지와 예상 견적이 함께 바뀝니다.</p>
                </div>
              </div>

              <div className="rental-options-panel">
                <div className="rental-options-title"><div><span>02 / 나의 렌트 조건</span><h3>아반떼장기렌트 예상 견적</h3></div><span className="rental-model-pill">가솔린 2.0</span></div>
                <fieldset className="rental-control">
                  <legend>트림 선택</legend>
                  <div className="rental-choice-group">
                    {trimOptions.map((trim) => <button key={trim.id} type="button" aria-pressed={rental.trim === trim.id} className={rental.trim === trim.id ? "active" : ""} onClick={() => updateRental("trim", trim.id)}>{trim.name}</button>)}
                  </div>
                  <p className="rental-field-hint">선택한 트림의 차량가: {formatWon(activeTrim.price)}원</p>
                </fieldset>

                <fieldset className="rental-control">
                  <legend>계약기간</legend>
                  <div className="rental-choice-group">
                    {monthOptions.map((month) => <button key={month} type="button" aria-pressed={rental.months === month} className={rental.months === month ? "active" : ""} onClick={() => updateRental("months", month)}>{month}개월</button>)}
                  </div>
                </fieldset>

                <fieldset className="rental-control">
                  <legend>1년 주행거리</legend>
                  <div className="rental-choice-group five-columns">
                    {mileageOptions.map((mileage) => <button key={mileage} type="button" aria-pressed={rental.mileage === mileage} className={rental.mileage === mileage ? "active" : ""} onClick={() => updateRental("mileage", mileage)}>{formatMileage(mileage)}</button>)}
                  </div>
                </fieldset>

                <div className="rental-payments">
                  <fieldset className="rental-control">
                    <legend>선납금</legend>
                    <div className="rental-choice-group four-columns">
                      {paymentOptions.map((percent) => <button key={percent} type="button" aria-pressed={rental.advance === percent} className={rental.advance === percent ? "active" : ""} onClick={() => updateRental("advance", percent)}>{percent}%</button>)}
                    </div>
                    <p className="rental-field-hint">미리 내는 렌트료 · 반환되지 않음</p>
                  </fieldset>
                  <fieldset className="rental-control">
                    <legend>보증금</legend>
                    <div className="rental-choice-group four-columns">
                      {paymentOptions.map((percent) => <button key={percent} type="button" aria-pressed={rental.deposit === percent} className={rental.deposit === percent ? "active" : ""} onClick={() => updateRental("deposit", percent)}>{percent}%</button>)}
                    </div>
                    <p className="rental-field-hint">계약이 끝나면 조건에 따라 반환</p>
                  </fieldset>
                </div>

                <div className="rental-estimate-result" aria-live="polite" aria-atomic="true">
                  <div className="rental-result-top"><span>예상 월 렌트료</span><small>2027년형 · 가솔린 2.0</small></div>
                  <div className={`rental-monthly-price ${estimate.monthlyRent === null ? "needs-consult" : ""}`}>
                    <strong>{estimate.monthlyRent === null ? "상담 후 안내" : formatWon(estimate.monthlyRent)}</strong>
                    {estimate.monthlyRent !== null && <span>원 / 월</span>}
                  </div>
                  {estimate.monthlyRent === null && <p className="rental-unlimited-note">무제한 주행은 렌터사마다 제공 여부와 요율이 달라요. 상담을 통해 확인해 드립니다.</p>}
                  <div className="rental-result-details"><span>선택한 차량가 {formatWon(estimate.vehiclePrice)}원</span><span>선납 {formatWon(estimate.advanceAmount)}원 · 보증 {formatWon(estimate.depositAmount)}원</span></div>
                  <button type="button" className="rental-consult-button" onClick={openConsultation}>선택한 조건으로 무료 견적 상담 <ArrowRight size={19} strokeWidth={1.8}/></button>
                </div>
              </div>
            </div>
            <p className="rental-estimate-note">차량가는 현대자동차 2026년 10월 공식 가격표 기준입니다. 월 렌트료는 공개된 시장 견적을 참고한 <strong>참고용 예상금액</strong>으로, 계약기간·주행거리별 차액과 보증금 할인율에는 임시 가정이 포함됩니다. 렌터사 요율, 보험·정비 조건, 심사 및 프로모션에 따라 실제 금액은 달라집니다.</p>
          </section>

          <section className="rental-benefits-section" id="benefits" aria-labelledby="benefits-title">
            <div className="benefits-heading scroll-reveal">
              <span className="explore-label">LONG-TERM RENTAL BENEFITS</span>
              <h2 id="benefits-title">아반떼 장기렌트,<br/><em>어떤 점이 편할까요?</em></h2>
              <p>처음 필요한 비용부터 계약 종료까지,<br/>알아두면 좋은 점을 쉽게 정리했습니다.</p>
            </div>
            <div className="benefits-list scroll-reveal">
              <article className="benefit-row"><span className="benefit-number">01</span><div className="benefit-icon"><Wallet size={25} strokeWidth={1.5}/></div><div><h3>처음 필요한 비용 조절</h3><p>선납금과 보증금 조건을 선택해 시작할 때 낼 금액을 조절할 수 있습니다.</p></div></article>
              <article className="benefit-row"><span className="benefit-number">02</span><div className="benefit-icon"><ShieldCheck size={25} strokeWidth={1.5}/></div><div><h3>보험료·자동차세까지 한 번에</h3><p>보험료와 자동차세가 월 렌트료에 포함되는 상품이 많아 차량 비용을 관리하기 쉽습니다.</p></div></article>
              <article className="benefit-row"><span className="benefit-number">03</span><div className="benefit-icon"><CalendarDays size={25} strokeWidth={1.5}/></div><div><h3>내 운전 습관에 맞춘 계약</h3><p>차를 이용할 기간과 1년 주행거리를 생활 패턴에 맞춰 선택할 수 있습니다.</p></div></article>
              <article className="benefit-row"><span className="benefit-number">04</span><div className="benefit-icon"><RotateCcw size={25} strokeWidth={1.5}/></div><div><h3>계약이 끝나면 인수 또는 반납</h3><p>상품에 따라 차를 계속 이용할지, 반납할지 선택할 수 있습니다.</p></div></article>
              <p className="benefits-note">※ 초기 비용, 보험 포함 범위, 만기 선택 가능 여부는 렌터사와 계약 조건에 따라 달라질 수 있습니다.</p>
            </div>
          </section>

          <section className="rental-faq-section" id="faq" aria-labelledby="faq-title">
            <div className="faq-heading scroll-reveal">
              <span className="explore-label">FREQUENTLY ASKED QUESTIONS</span>
              <h2 id="faq-title">계약 전에 궁금한 점,<br/><em>여기서 확인하세요.</em></h2>
              <p>장기렌트를 알아볼 때 자주 나오는 질문들을 모았습니다.</p>
            </div>
            <div className="faq-accordion scroll-reveal">
              {faqItems.map((item,index) => (
                <div className={`faq-item ${openFaq === index ? "open" : ""}`} key={item.question}>
                  <h3>
                    <button type="button" id={`faq-question-${index}`} aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                      <span className="faq-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="faq-question-text">{item.question}</span>
                      <ChevronDown size={20} strokeWidth={1.5}/>
                    </button>
                  </h3>
                  <div className="faq-answer" role="region" id={`faq-answer-${index}`} aria-labelledby={`faq-question-${index}`} hidden={openFaq !== index}><p>{item.answer}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="final-cta-section" id="consultation" aria-labelledby="final-cta-title">
            <img src="/avante/avante-02.webp" alt="어두운 배경 앞에 세워진 아반떼의 뒤쪽 디자인" loading="lazy" />
            <div className="final-cta-copy">
              <span>AVANTE RENTAL · FREE CONSULTATION</span>
              <h2 id="final-cta-title">원하는 아반떼,<br/>내 조건으로 만나보세요.</h2>
              <p>마음에 드는 아반떼가 있으신가요?<br/>내게 맞는 조건을 편하게 알아보세요.</p>
              <button type="button" onClick={() => handleNavigation("컬러 · 견적")}>무료 견적 알아보기 <ArrowRight size={19} strokeWidth={1.8}/></button>
            </div>
          </section>

          <footer className="fitcar-footer" id="footer">
            <div className="fitcar-footer-top">
              <div className="footer-brand"><strong>FITCAR<span>.</span></strong><small>아반떼 장기렌트 · 핏카컴퍼니</small></div>
              <div className="footer-navigation"><button type="button" onClick={() => handleNavigation("컬러 · 견적")}>무료 견적 알아보기</button><button type="button" onClick={() => handleNavigation("FAQ")}>자주 묻는 질문</button><button type="button" onClick={openConsultation}>무료 견적 상담</button></div>
            </div>
            <div className="footer-legal">
              <div className="footer-policy"><button type="button" onClick={() => setLegalOpen("privacy")}>개인정보처리방침</button><i/> <button type="button" onClick={() => setLegalOpen("terms")}>이용약관</button></div>
              <p>상호명 핏카컴퍼니 <b>·</b> 대표자 김민철 <b>·</b> 사업자등록번호 578-36-01253 <b>·</b> 주소 인천 서구 파랑로 495 에이스하이테크시티 1동 1004호</p>
              <p className="footer-keywords">아반떼장기렌트 · 아반떼렌트가격 · 아반떼장기렌트상담 · 아반떼장기렌트견적 · 디올뉴아반떼장기렌트 · 아반떼장기렌트비용</p>
              <div className="footer-bottom"><span>© FitCar Company. All rights reserved.</span><span>차량 이미지 출처: 현대자동차 공식 홈페이지</span></div>
            </div>
          </footer>
        </div>
      </div>

      <dialog ref={consultDialogRef} data-lenis-prevent className="consult-dialog" aria-labelledby="consult-dialog-title" aria-describedby="consult-dialog-description" onClose={() => setConsultOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setConsultOpen(false); }}>
        <div className="consult-modal">
          <button type="button" className="consult-close" aria-label="상담 신청 팝업 닫기" onClick={() => setConsultOpen(false)}><X size={20} /></button>
          {consultReviewed ? (
            <div className="consult-reviewed" role="status">
              <CheckCircle2 size={43} strokeWidth={1.4} />
              <h2 id="consult-dialog-title">입력 내용을 확인했어요.</h2>
              <p id="consult-dialog-description">현재 상담 접수 기능을 준비하고 있어 실제 요청은 전송되지 않았어요.<br/>입력하신 고객 정보도 저장되지 않았습니다.</p>
              <button type="button" onClick={() => setConsultOpen(false)}>확인하고 닫기</button>
            </div>
          ) : (
            <>
              <div className="consult-head">
                <span>FITCAR · FREE CONSULTATION</span>
                <h2 id="consult-dialog-title">아반떼 장기렌트,<br/><em>편하게 상담받아 보세요.</em></h2>
                <p id="consult-dialog-description">연락받을 정보를 남겨주시면, 선택하신 조건에 맞춰 견적을 안내해 드리는 상담 신청 화면입니다.</p>
              </div>
              <div className="consult-selected">
                <div><span>내가 선택한 아반떼</span><strong>{activeTrim.name} · {activeColor.name}</strong></div>
                <p>{rental.months}개월 · 연 {formatMileage(rental.mileage)} · 선납 {rental.advance}% · 보증 {rental.deposit}%</p>
                <span className="consult-estimated">현재 예상 월 렌트료 <b>{estimate.monthlyRent === null ? "별도 상담" : `${formatWon(estimate.monthlyRent)}원`}</b></span>
              </div>
              <form className="consult-form" onSubmit={submitConsultation} noValidate>
                <div className="consult-fields">
                  <label htmlFor="consult-name">고객명 <span>필수</span><input id="consult-name" type="text" autoComplete="name" placeholder="성함을 입력해 주세요" value={consultName} maxLength={30} onChange={(event) => {setConsultName(event.target.value);setConsultError("");}} required /></label>
                  <label htmlFor="consult-phone">연락처 <span>필수</span><input id="consult-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" value={consultPhone} maxLength={13} onChange={(event) => {setConsultPhone(formatPhoneInput(event.target.value));setConsultError("");}} required /></label>
                </div>
                <label htmlFor="consult-message" className="consult-message-label">문의 내용 <small>선택</small><textarea id="consult-message" placeholder="궁금하신 점이나 원하는 상담 시간을 적어주세요." value={consultMessage} maxLength={500} rows={3} onChange={(event) => setConsultMessage(event.target.value)} /></label>
                <div className="consult-privacy-row">
                  <label className="consult-privacy-agree"><input type="checkbox" checked={privacyAgreed} onChange={(event) => {setPrivacyAgreed(event.target.checked);setConsultError("");}} /><span>개인정보 수집·이용 동의 <b>(필수)</b></span></label>
                  <button type="button" className="consult-privacy-toggle" aria-expanded={privacyExpanded} aria-controls="consult-privacy-detail" onClick={() => setPrivacyExpanded(!privacyExpanded)}>{privacyExpanded ? "내용 닫기" : "내용 보기"}<ChevronDown size={14}/></button>
                </div>
                {privacyExpanded && <div className="consult-privacy-detail" id="consult-privacy-detail">
                  <strong>개인정보 수집·이용 안내</strong>
                  <p>수집 항목: 고객명, 연락처, 문의 내용, 선택한 차량·견적 조건</p>
                  <p>이용 목적: 아반떼 장기렌트 견적 안내 및 상담 연락</p>
                  <p>보유·이용 기간: 실제 상담 서비스 연동 전에 운영자의 개인정보 처리방침에 따라 확정 예정</p>
                  <p>동의를 거부할 수 있으며, 거부 시 상담 신청을 진행할 수 없습니다.</p>
                </div>}
                {consultError && <p className="consult-form-error" role="alert">{consultError}</p>}
                <button type="submit" className="consult-submit">무료 견적 상담 내용 확인하기 <ArrowRight size={19}/></button>
                <p className="consult-demo-note">※ 상담 접수 기능 준비 중입니다. 현재 입력한 정보는 서버에 저장되거나 전송되지 않습니다.</p>
              </form>
            </>
          )}
        </div>
      </dialog>

      <dialog ref={legalDialogRef} data-lenis-prevent className="legal-dialog" aria-labelledby="legal-dialog-title" onClose={() => setLegalOpen(null)} onClick={(event) => { if (event.target === event.currentTarget) setLegalOpen(null); }}>
        {legalOpen && (
          <div className="legal-modal">
            <button type="button" className="consult-close" aria-label={`${legalDocuments[legalOpen].title} 닫기`} onClick={() => setLegalOpen(null)}><X size={20} /></button>
            <div className="legal-document">
              <span>FITCAR · LEGAL</span>
              <h2 id="legal-dialog-title">{legalDocuments[legalOpen].title}</h2>
              <p className="legal-updated">시행일 {legalDocuments[legalOpen].updated}</p>
              {legalDocuments[legalOpen].sections.map((section) => (
                <section key={section.heading}>
                  <h3>{section.heading}</h3>
                  {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </section>
              ))}
            </div>
          </div>
        )}
      </dialog>

    </main>
  );
}
