import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { isEnding, nodeOf } from "~/entities/act";
import { fetchRoom, joinRoom, myPick, type Analysis, type RoomPayload } from "~/entities/room";
import { useVote } from "~/features/cast-vote";
import { WaitingBar } from "~/features/host-control";
import { NameGate, useIdentity } from "~/features/join-room";
import { isNotFound, usePolling } from "~/shared/lib";
import { EndingScroll } from "~/widgets/ending-scroll";
import { JourneyStage } from "~/widgets/journey-stage";
import { PartyPanel } from "~/widgets/party-panel";
import { SajuScroll } from "~/widgets/saju-scroll";
import { TeamAnalysis } from "~/widgets/team-analysis";
import { TopMeter } from "~/widgets/top-meter";

type Gate = "checking" | "missing" | "naming" | "joining" | "in";

/** 참여자 화면. 각자 자기 기기에서 연다. 집계와 결과는 여기 오지 않는다. */
export function PlayPage() {
  const room = (useParams().room ?? "").toUpperCase();
  const { pid, name, setName, ready } = useIdentity();
  const [gate, setGate] = useState<Gate>("checking");

  const load = useCallback(() => fetchRoom(room, pid), [room, pid]);
  const { data, error, set } = usePolling<RoomPayload>(load, { enabled: gate === "in" });

  // 들어가기 전에 방이 실제로 있는지부터 확인한다 — 없는 코드로 방이 생기면 안 된다
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    fetchRoom(room, null)
      .then(() => alive && setGate((g) => (g === "checking" ? "naming" : g)))
      .catch((e) => alive && setGate(isNotFound(e) ? "missing" : "naming"));
    return () => {
      alive = false;
    };
  }, [ready, room]);

  // 이름이 있으면 바로 합류한다
  useEffect(() => {
    if (gate !== "naming" || !pid || !name.trim()) return;
    setGate("joining");
    joinRoom(room, pid, name.trim())
      .then((payload) => {
        set(payload);
        setGate("in");
      })
      .catch((e) => setGate(isNotFound(e) ? "missing" : "naming"));
  }, [gate, pid, name, room, set]);

  if (!ready || gate === "checking") return <div className="app" />;

  if (gate === "missing") {
    return (
      <div className="app">
        <main className="home">
          <div className="home-in">
            <h1>없는 방입니다</h1>
            <p className="lede">
              <span className="roomcode">{room}</span> 방을 찾을 수 없습니다. 코드를 다시
              확인해 주세요. 방은 하루가 지나면 사라집니다.
            </p>
            <Link className="btn" to="/" style={{ display: "inline-block", textDecoration: "none" }}>
              처음으로
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (gate !== "in") {
    return (
      <div className="app">
        <NameGate
          room={room}
          initialName={name}
          busy={gate === "joining"}
          onSubmit={setName}
        />
      </div>
    );
  }

  return (
    <RoomShell room={room} payload={data} error={error} set={set} pid={pid} name={name} />
  );
}

function RoomShell({
  room, payload, error, set, pid, name,
}: {
  room: string;
  payload: RoomPayload | null;
  error: string | null;
  set: (next: RoomPayload) => void;
  pid: string | null;
  name: string;
}) {
  const { vote } = useVote(room, pid, name, set);
  const state = payload?.state;
  const finished = state ? isEnding(state.nodeId) : false;
  const node = state && !finished ? nodeOf(state.nodeId) : null;

  const onAnalysis = (analysis: Analysis) => {
    if (payload) set({ ...payload, state: { ...payload.state, analysis } });
  };

  return (
    <div className="app">
      <TopMeter payload={payload} room={room} />

      <div className="cols">
        <main>
          {!payload || !state ? (
            <p className="note" style={{ padding: "40px 0" }}>
              {error ?? "방을 불러오는 중입니다…"}
            </p>
          ) : finished ? (
            <>
              <EndingScroll nodeId={state.nodeId} path={state.path} />
              <SajuScroll payload={payload} />
              <TeamAnalysis
                room={room}
                hostKey={null}
                analysis={state.analysis}
                sessionId={state.sessionId}
                hasPlayers={payload.roster.length > 0}
                onDone={onAnalysis}
              />
            </>
          ) : node ? (
            <JourneyStage
              node={node}
              picked={myPick(payload)}
              locked={state.phase !== "vote"}
              onPick={(choice) => vote(node.id, choice)}
            />
          ) : (
            <p className="note" style={{ padding: "40px 0" }}>이 마디를 찾을 수 없습니다.</p>
          )}
        </main>

        <PartyPanel payload={payload} isHost={false} meId={pid} />
      </div>

      <WaitingBar phase={state?.phase ?? "vote"} />
    </div>
  );
}
