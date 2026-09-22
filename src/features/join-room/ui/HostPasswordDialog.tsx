import { useState, type ReactNode } from "react";
import { Button, Modal, TextField } from "~/shared/ui";

export type HostPasswordDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  caption?: ReactNode;
  submitLabel: string;
  /** 비밀번호를 서버로 보내는 동작. 실패하면 던져서 메시지를 보여준다. */
  onSubmit: (password: string) => Promise<void>;
};

/** 진행자 비밀번호를 묻는 팝업. 방을 새로 열 때와 진행자 자리를 이어받을 때 같이 쓴다. */
export function HostPasswordDialog({
  open, onClose, title, caption, submitLabel, onSubmit,
}: HostPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await onSubmit(password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "확인하지 못했습니다");
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title={title}
      caption={caption}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password && !busy) void submit();
        }}
      >
        <TextField
          label="진행자 비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={busy}
        />
        {error ? <p className="note warn" style={{ marginBottom: 12 }}>{error}</p> : null}
        <Button variant="primary" type="submit" disabled={!password || busy} style={{ width: "100%" }}>
          {busy ? "확인 중…" : submitLabel}
        </Button>
      </form>
    </Modal>
  );
}
