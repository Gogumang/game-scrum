import { useState } from "react";
import { useNavigate } from "react-router";
import { createRoom } from "~/entities/room";
import { Button, TextField } from "~/shared/ui";
import { rememberHostKey } from "../model/useHostKey";
import { HostPasswordDialog } from "./HostPasswordDialog";

/** 방 코드로 참여하거나, 진행자 비밀번호를 넣고 새 방을 연다. */
export function RoomLauncher() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [asking, setAsking] = useState(false);

  return (
    <main className="home">
      <div className="home-in">
        <h1>전자금융의 기묘한 하루</h1>
        <p className="lede">
          마왕을 무찌르러 가는 다섯 개의 갈림길. 팀이 각자 고르고, 마지막엔 오늘의 사주와 AI 팀
          분석으로 마무리합니다.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const clean = code.trim().toUpperCase();
            if (clean) navigate(`/r/${clean}`);
          }}
        >
          <TextField
            label="방 코드"
            code
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ABC123"
            inputMode="text"
            autoCapitalize="characters"
            autoFocus
          />
          <Button variant="primary" type="submit" disabled={code.trim().length < 4} style={{ width: "100%" }}>
            참여하기
          </Button>
        </form>

        <div className="divider">진행자라면</div>

        <div className="stack">
          <Button onClick={() => setAsking(true)}>진행자로 새 방 만들기</Button>
        </div>
      </div>

      <HostPasswordDialog
        open={asking}
        onClose={() => setAsking(false)}
        title="진행자 비밀번호"
        caption="방을 여는 사람만 입력하면 됩니다."
        submitLabel="새 방 열기"
        onSubmit={async (password) => {
          const { room, hostKey } = await createRoom(password);
          rememberHostKey(room, hostKey);
          navigate(`/r/${room}/host`);
        }}
      />
    </main>
  );
}
