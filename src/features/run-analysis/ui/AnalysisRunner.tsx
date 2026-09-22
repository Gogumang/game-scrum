import { useEffect, useRef, useState } from "react";
import { requestAnalysis, type Analysis } from "~/entities/room";
import { StatusDot } from "~/shared/ui";

export type AnalysisRunnerProps = {
  room: string;
  hostKey: string | null;
  onDone: (analysis: Analysis) => void;
  /** 참여자가 아무도 없으면 돌릴 수 없다 */
  disabled?: boolean;
};

/** 오래 걸린다고 보기 시작하는 시점 */
const SLOW_MS = 25_000;

/**
 * 팀 분석은 파티가 엔딩에 닿는 순간 서버가 미리 돌려 둔다.
 * 그래서 이 화면은 보통 기다리는 표시만 잠깐 보여주고, 폴링이 결과를 가져온다.
 * 예열이 실패했을 때를 위해 진행자에게만 직접 돌리는 버튼을 남겨둔다.
 */
export function AnalysisRunner({ room, hostKey, onDone, disabled = false }: AnalysisRunnerProps) {
  const [slow, setSlow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(Date.now());

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), SLOW_MS - (Date.now() - started.current));
    return () => window.clearTimeout(timer);
  }, []);

  async function run() {
    if (!hostKey || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { analysis } = await requestAnalysis(room, hostKey);
      if (analysis) onDone(analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석에 실패했습니다");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="ai-wait">
        <StatusDot />
        {busy
          ? "다시 정리하는 중입니다…"
          : slow
            ? "생각보다 오래 걸리고 있습니다…"
            : "점술사가 파티의 기록을 읽는 중입니다…"}
      </p>

      {error ? <p className="note warn">{error}</p> : null}

      {hostKey && (slow || error) ? (
        <button className="ai-run" type="button" onClick={run} disabled={disabled || busy}>
          {error ? "다시 시도" : "직접 돌리기"}
        </button>
      ) : null}

      {!hostKey && slow ? (
        <p className="note">진행자 화면에서 다시 돌릴 수 있습니다.</p>
      ) : null}
    </>
  );
}
