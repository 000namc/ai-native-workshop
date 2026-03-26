(async () => {
  const SECTION_ID = "3716:13995";   // 매뉴얼 v1.3 섹션 (26.02 페이지)
  const START_PAGE_NUMBER = 1;       // 테스트용 시작 번호
  const SKIP_FRAMES = ["00", "01"];  // 표지·목차 건너뜀

  // 진행 상황 토스트
  let notifyHandler = null;
  function showProgress(current, total, frameName) {
    const percent = Math.round((current / total) * 100);
    const filled = Math.round(percent / 5); // 20칸 기준
    const bar = "█".repeat(filled) + "░".repeat(20 - filled);
    const msg = `[${bar}] ${percent}% (${current}/${total}) — ${frameName}`;
    if (notifyHandler) notifyHandler.cancel();
    notifyHandler = figma.notify(msg, { timeout: 60000 });
  }

  // 1. 섹션 노드 가져오기
  notifyHandler = figma.notify("🔍 섹션 탐색 중...", { timeout: 60000 });
  const section = figma.getNodeById(SECTION_ID);
  if (!section || section.type !== "SECTION") {
    figma.notify("❌ 섹션을 찾을 수 없어요!", { error: true });
    figma.closePlugin();
    return;
  }

  // 2. 프레임 필터 및 정렬 (행 우선: 위→아래, 같은 행은 좌→우)
  const frames = section.children
    .filter(node => node.type === "FRAME" && !SKIP_FRAMES.includes(node.name))
    .sort((a, b) => {
      const rowA = Math.round(a.y / 900);
      const rowB = Math.round(b.y / 900);
      return rowA !== rowB ? rowA - rowB : a.x - b.x;
    });

  const total = frames.length;

  if (total === 0) {
    figma.notify("⚠️ 처리할 프레임이 없어요!", { error: true });
    figma.closePlugin();
    return;
  }

  // 3. 각 프레임 footer > {current} 수정
  let pageNum = START_PAGE_NUMBER;
  let successCount = 0;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    showProgress(i + 1, total, frame.name);

    const footer = frame.children.find(
      node => node.type === "INSTANCE" && node.name === "footer"
    );
    if (!footer) continue;

    const currentNode = footer.children.find(
      node => node.type === "TEXT" && node.name === "{current}"
    );
    if (!currentNode) continue;

    try {
      await figma.loadFontAsync(currentNode.fontName);
      currentNode.characters = String(pageNum);
      successCount++;
      pageNum++;
    } catch (err) {
      console.error(`[✗] ${frame.name}:`, err);
    }
  }

  if (notifyHandler) notifyHandler.cancel();
  figma.notify(
    `✅ ${successCount}개 완료! (${START_PAGE_NUMBER}~${pageNum - 1}페이지)`,
    { timeout: 5000 }
  );
  figma.closePlugin();
})();
