import { useEffect, useState } from "react";
import { DialogueBox, SceneArt, usePrefetchNextScenes, type StoryNode } from "~/entities/act";
import { ChoiceList } from "~/features/cast-vote";
import { Modal, StatusLine } from "~/shared/ui";

export type JourneyStageProps = {
  node: StoryNode;
  picked: number | null;
  /** 진행자가 선택을 마감했는지 */
  locked: boolean;
  onPick: (index: number) => void;
};

/**
 * 참여자 화면. 장면과 대사를 보고 선택지를 모달에서 고른다.
 * 집계와 결과는 여기 오지 않는다 — 진행자만 본다.
 */
export function JourneyStage({ node, picked, locked, onPick }: JourneyStageProps) {
  // 다음에 갈 수 있는 장면을 대사 읽는 동안 미리 받아둔다
  usePrefetchNextScenes(node);

  const skip = picked !== null || locked;

  const [lineIndex, setLineIndex] = useState(skip ? node.script.length - 1 : 0);
  const [scriptDone, setScriptDone] = useState(skip);
  const [instant, setInstant] = useState(true);
  const [modalOpen, setModalOpen] = useState(skip && !locked);

  // 마디가 바뀌면 렌더 중에 곧바로 되돌린다.
  // effect 로 미루면 새 마디와 이전 줄 번호가 섞인 렌더가 한 번 끼어드는데,
  // 다음 마디의 대사가 더 짧으면 없는 줄을 읽어 터진다.
  const [shownNodeId, setShownNodeId] = useState(node.id);
  if (shownNodeId !== node.id) {
    setShownNodeId(node.id);
    setLineIndex(skip ? node.script.length - 1 : 0);
    setScriptDone(skip);
    setModalOpen(false);
    setInstant(true);
  }

  // 마감되면 모달을 닫고 대기 안내로 넘어간다
  useEffect(() => {
    if (!locked) return;
    setLineIndex(node.script.length - 1);
    setScriptDone(true);
    setInstant(true);
    setModalOpen(false);
  }, [locked, node.script.length]);

  function advance() {
    if (scriptDone) return;
    if (safeIndex < node.script.length - 1) {
      setInstant(false);
      setLineIndex(safeIndex + 1);
    } else {
      setScriptDone(true);
      if (!locked) setModalOpen(true);
    }
  }

  function replay() {
    setModalOpen(false);
    setInstant(false);
    setLineIndex(0);
    setScriptDone(false);
  }

  // 어떤 이유로든 범위를 벗어나면 마지막 줄로 잡아둔다 (빈 화면·크래시 방지)
  const safeIndex = Math.min(Math.max(lineIndex, 0), node.script.length - 1);
  const line = node.script[safeIndex];

  return (
    <>
      <p className="eyebrow">
        <span className="n">제 {node.act} 막</span>
        {node.when}
      </p>

      <div className="vn">
        <SceneArt name={node.scene} />
        <DialogueBox
          line={line}
          last={safeIndex === node.script.length - 1}
          instant={instant}
          showTip={!scriptDone}
          onAdvance={advance}
        />
      </div>

      {scriptDone && !modalOpen ? (
        locked ? (
          <StatusLine>
            {picked !== null
              ? `“${node.choices[picked].text}” 을 골랐습니다 · 진행자가 결과를 확인하는 중입니다`
              : "선택이 마감되었습니다 · 진행자가 결과를 확인하는 중입니다"}
          </StatusLine>
        ) : (
          <>
            <button className="open-choices" type="button" onClick={() => setModalOpen(true)}>
              {picked !== null ? "내 선택 보기 · 바꾸기" : "선택지 보기"}
            </button>
            {picked === null ? <StatusLine>아직 고르지 않았습니다</StatusLine> : null}
          </>
        )
      ) : null}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={node.ask}
        caption={picked !== null ? "다시 눌러 바꿀 수 있어요" : "하나만 고르세요"}
        footer={
          <button className="replay-wide" type="button" onClick={replay}>
            장면 다시 보기
          </button>
        }
      >
        <ChoiceList
          choices={node.choices}
          counts={null}
          voters={0}
          picked={picked}
          locked={locked}
          onPick={onPick}
        />
      </Modal>
    </>
  );
}
