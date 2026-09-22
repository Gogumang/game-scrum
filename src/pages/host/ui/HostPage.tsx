import { useCallback, useState } from "react";
import { Link, useLoaderData, useParams } from "react-router";
import { isEnding, nodeOf } from "~/entities/act";
import { claimHost, fetchRoom, voteProgress, type Analysis, type RoomPayload } from "~/entities/room";
import { ControlBar, useHostCommand } from "~/features/host-control";
import { HostPasswordDialog, useHostKey } from "~/features/join-room";
import { usePolling } from "~/shared/lib";
import { Button } from "~/shared/ui";
import { EndingScroll } from "~/widgets/ending-scroll";
import { HostConsole } from "~/widgets/host-console";
import { SajuScroll } from "~/widgets/saju-scroll";
import { TeamAnalysis } from "~/widgets/team-analysis";
import { RoomCodeCard } from "~/widgets/room-code";
import { TopMeter } from "~/widgets/top-meter";

/**
 * 진행자 콘솔. 집계는 여기서만 보인다.
 * 다수 선택을 확인하고 다음 갈림길로 넘길지 정한다.
 */
export function HostPage() {
  const room = (useParams().room ?? "").toUpperCase();
  const { hostKey, ready, setHostKey } = useHostKey(room);
  const [asking, setAsking] = useState(true);
  const { joinUrl, qrSvg } = useLoaderData() as { joinUrl: string; qrSvg: string };

  const load = useCallback(() => fetchRoom(room, null, hostKey), [room, hostKey]);
  const { data, error, set } = usePolling<RoomPayload>(load, { enabled: ready && !!hostKey });
  const { run, busy } = useHostCommand(room, hostKey, set);

  if (!ready) return <div className="app" />;

  // 키가 없으면 비밀번호를 물어 진행자 자리를 이어받는다
  if (!hostKey) {
    return (
      <div className="app">
        <main className="home">
          <div className="home-in">
            <h1>진행자로 들어가기</h1>
            <p className="lede">
              <span className="roomcode">{room}</span> 방의 진행을 맡으려면 비밀번호가 필요합니다.
            </p>
            <div className="stack">
              <Button variant="primary" onClick={() => setAsking(true)}>
                비밀번호 입력
              </Button>
              <Link className="btn" to={`/r/${room}`} style={{ textAlign: "center", textDecoration: "none" }}>
                참여자로 들어가기
              </Link>
            </div>
          </div>
        </main>

        <HostPasswordDialog
          open={asking}
          onClose={() => setAsking(false)}
          title="진행자 비밀번호"
          caption={`${room} 방의 진행을 이어받습니다.`}
          submitLabel="진행자로 들어가기"
          onSubmit={async (password) => {
            const { hostKey: key } = await claimHost(room, password);
            setHostKey(key);
          }}
        />
      </div>
    );
  }

  const state = data?.state;
  const finished = state ? isEnding(state.nodeId) : false;
  const node = state && !finished ? nodeOf(state.nodeId) : null;
  const { allDone } = voteProgress(data);

  const onAnalysis = (analysis: Analysis) => {
    if (data) set({ ...data, state: { ...data.state, analysis } });
  };

  return (
    <div className="app">
      <TopMeter payload={data} room={room} />

      <div className="cols solo">
        <main>
          {!data || !state ? (
            <p className="note" style={{ padding: "40px 0" }}>
              {error ?? "방을 불러오는 중입니다…"}
            </p>
          ) : finished ? (
            <>
              <EndingScroll nodeId={state.nodeId} path={state.path} />
              <SajuScroll payload={data} />
              <TeamAnalysis
                room={room}
                hostKey={hostKey}
                analysis={state.analysis}
                sessionId={state.sessionId}
                hasPlayers={data.roster.length > 0}
                onDone={onAnalysis}
              />
            </>
          ) : node ? (
            <>
              <RoomCodeCard
                room={room}
                joinUrl={joinUrl}
                qrSvg={qrSvg}
                compact={data.roster.length > 0}
              />
              <HostConsole node={node} payload={data} />
            </>
          ) : (
            <p className="note" style={{ padding: "40px 0" }}>이 마디를 찾을 수 없습니다.</p>
          )}
        </main>
      </div>

      <ControlBar
        phase={state?.phase ?? "vote"}
        atEnding={finished}
        canGoBack={(state?.path.length ?? 0) > 0}
        allDone={allDone}
        busy={busy}
        onCommand={run}
      />
    </div>
  );
}
