import { mkdir, readFile, writeFile } from "node:fs/promises";
import { renderToString } from "react-dom/server";
import Home, { faqItems } from "../src/Home";

const title = "아반떼 장기렌트 가격·견적 | 무료 견적 상담 - 핏카컴퍼니";
const description = "아반떼 장기렌트 가격부터 예상 월 렌트료까지! 디 올 뉴 아반떼 가솔린 2.0의 트림, 컬러, 계약기간, 주행거리를 선택하고 핏카컴퍼니에서 무료 견적 상담을 받아보세요.";
const siteName = "핏카컴퍼니 아반떼 장기렌트";

function validUrl(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const candidate = raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`;
  const parsed = new URL(candidate);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("SITE_URL에는 HTTP(S) 주소를 입력해야 합니다.");
  }
  return parsed.origin + (parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, ""));
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 정식 도메인 확정 전 기준 주소. SITE_URL이 있으면 그 값이 우선합니다.
const temporarySiteUrl = "https://rental-car-hyendai-avante.vercel.app";
const siteUrl = validUrl(process.env.SITE_URL) ?? validUrl(temporarySiteUrl);
if (!siteUrl) throw new Error("사이트 주소를 확인하지 못했습니다.");
// 배포별 미리보기 주소는 색인하지 않고, 기준 주소로 canonical을 모읍니다.
const indexable = process.env.ENABLE_INDEXING !== "false" && process.env.VERCEL_ENV !== "preview";
const imageUrl = `${siteUrl}/og-avante-rental.webp`;

const meta: string[] = [
  `<meta name="robots" content="${indexable ? "index,follow,max-image-preview:large" : "noindex,nofollow"}" />`,
  `<meta name="googlebot" content="${indexable ? "index,follow,max-image-preview:large" : "noindex,nofollow"}" />`,
  `<link rel="canonical" href="${escapeAttr(siteUrl)}/" />`,
  '<meta property="og:type" content="website" />',
  '<meta property="og:locale" content="ko_KR" />',
  `<meta property="og:site_name" content="${escapeAttr(siteName)}" />`,
  `<meta property="og:title" content="${escapeAttr(title)}" />`,
  `<meta property="og:description" content="${escapeAttr(description)}" />`,
  `<meta property="og:url" content="${escapeAttr(siteUrl)}/" />`,
  `<meta name="twitter:url" content="${escapeAttr(siteUrl)}/" />`,
  `<meta property="og:image" content="${escapeAttr(imageUrl)}" />`,
  '<meta property="og:image:type" content="image/webp" />',
  '<meta property="og:image:width" content="1200" />',
  '<meta property="og:image:height" content="630" />',
  '<meta property="og:image:alt" content="아반떼 장기렌트 가격·견적 무료 상담 | 핏카컴퍼니" />',
  '<meta name="twitter:card" content="summary_large_image" />',
  `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
  `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
  `<meta name="twitter:image" content="${escapeAttr(imageUrl)}" />`,
  '<meta name="twitter:image:alt" content="아반떼 장기렌트 가격과 무료 견적 상담" />',
];

// 공식 SNS 계정이 제공되지 않았으므로 실제 계정 링크는 추가하지 않습니다.
// 카카오톡·페이스북 등은 표준 Open Graph 정보를 공유 미리보기에 사용합니다.
const organizationId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;
const webpageId = `${siteUrl}/#webpage`;
const serviceId = `${siteUrl}/#rental-service`;
const faqId = `${siteUrl}/#faq`;
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: "핏카컴퍼니",
      legalName: "핏카컴퍼니",
      url: siteUrl,
      logo: `${siteUrl}/fitcar-apple-touch.png`,
      taxID: "578-36-01253",
      address: {
        "@type": "PostalAddress",
        streetAddress: "서구 파랑로 495 에이스하이테크시티 1동 1004호",
        addressLocality: "인천광역시",
        addressCountry: "KR",
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteUrl,
      name: siteName,
      inLanguage: "ko-KR",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: `${siteUrl}/`,
      name: title,
      description,
      inLanguage: "ko-KR",
      isPartOf: { "@id": websiteId },
      about: { "@id": serviceId },
      hasPart: { "@id": faqId },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: imageUrl,
        width: 1200,
        height: 630,
      },
    },
    {
      "@type": "Service",
      "@id": serviceId,
      name: "디 올 뉴 아반떼 가솔린 2.0 장기렌트 견적 상담",
      serviceType: "아반떼 장기렌트 예상 견적 및 상담",
      description: "디 올 뉴 아반떼 가솔린 2.0 차량의 트림, 색상, 계약기간, 주행거리에 따른 예상 장기렌트료 확인 및 상담 서비스",
      areaServed: { "@type": "Country", name: "대한민국" },
      provider: { "@id": organizationId },
      mainEntityOfPage: { "@id": webpageId },
    },
    {
      "@type": "FAQPage",
      "@id": faqId,
      url: `${siteUrl}/#faq`,
      inLanguage: "ko-KR",
      isPartOf: { "@id": webpageId },
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

meta.push(`<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>`);

const template = await readFile("dist/index.html", "utf8");
if (!template.includes('<div id="root"></div>') || !template.includes("<!-- SEO_META -->")) {
  throw new Error("배포 HTML의 렌더링 지점 또는 SEO 지점을 찾을 수 없습니다.");
}
const renderedHtml = renderToString(<Home />);
const html = template
  .replace('<div id="root"></div>', `<div id="root">${renderedHtml}</div>`)
  .replace("<!-- SEO_META -->", meta.join("\n    "));
await writeFile("dist/index.html", html, "utf8");

// robots.txt에서 noindex 페이지를 차단하면 검색엔진이 메타태그를 읽지 못합니다.
// 그래서 크롤링 자체는 허용하고, HTML의 robots 메타에서 색인을 제어합니다.
await writeFile("dist/robots.txt", `User-agent: *\nAllow: /\n${indexable ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ""}`);
if (indexable) {
  await mkdir("dist", { recursive: true });
  const escapedSiteUrl = siteUrl.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  await writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapedSiteUrl}/</loc><lastmod>2026-11-02</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url></urlset>\n`);
}

console.log(`사전 렌더링 완료 · ${indexable ? "검색 색인 허용" : "검색 색인 비허용"} · ${siteUrl}`);
