import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import Home from "./Home";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("페이지 루트 요소를 찾지 못했습니다.");

// 개발 서버는 CSR, 배포본은 빌드 시 사전 렌더링한 HTML에 hydration합니다.
if (root.hasChildNodes()) {
  hydrateRoot(root, <Home />);
} else {
  createRoot(root).render(<Home />);
}
