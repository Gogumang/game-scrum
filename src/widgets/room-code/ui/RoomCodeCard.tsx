import { useState } from "react";
import { Panel } from "~/shared/ui";

export type RoomCodeCardProps = {
  room: string;
  /** 참여자가 열 주소 */
  joinUrl: string;
  /** 서버에서 만든 QR (svg 문자열) */
  qrSvg: string;
  /** 사람이 들어오기 시작하면 작게 줄인다 */
  compact?: boolean;
};

/** 진행자가 팀에게 방을 알려주는 카드. 코드·링크·QR 을 한 번에 보여준다. */
export function RoomCodeCard({ room, joinUrl, qrSvg, compact = false }: RoomCodeCardProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* 클립보드를 못 쓰면 링크를 직접 읽으면 된다 */
    }
  }

  return (
    <Panel className={compact ? "roomcard compact" : "roomcard"} title="팀에게 알려주세요">
      <div className="roomcard-body">
        <div className="roomcard-left">
          <p className="roomcard-code">{room}</p>
          <p className="roomcard-url">{joinUrl.replace(/^https?:\/\//, "")}</p>
          <button className="roomcard-copy" type="button" onClick={copy}>
            {copied ? "복사됨" : "링크 복사"}
          </button>
        </div>
        <div
          className="roomcard-qr"
          aria-label="참여 링크 QR 코드"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      </div>
      {!compact ? (
        <p className="note" style={{ marginTop: 14 }}>
          팀원은 QR 을 찍거나, 첫 화면에서 방 코드를 입력하면 들어옵니다.
        </p>
      ) : null}
    </Panel>
  );
}
