import { useState } from "react";
import { Button, TextField } from "~/shared/ui";

/** 방에 들어오기 전 이름만 받는다. 짧게, 한 화면. */
export function NameGate({
  room,
  initialName,
  onSubmit,
  busy = false,
}: {
  room: string;
  initialName: string;
  onSubmit: (name: string) => void;
  busy?: boolean;
}) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();

  return (
    <main className="home">
      <form
        className="home-in"
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed) onSubmit(trimmed);
        }}
      >
        <h1>여정에 합류합니다</h1>
        <p className="lede">
          <span className="roomcode">{room}</span> 방에 들어갑니다. 파티에 표시될 이름을 알려주세요.
        </p>
        <TextField
          label="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          placeholder="예) 김개발"
          autoFocus
          required
        />
        <Button variant="primary" type="submit" disabled={!trimmed || busy} style={{ width: "100%" }}>
          {busy ? "들어가는 중…" : "합류하기"}
        </Button>
      </form>
    </main>
  );
}
