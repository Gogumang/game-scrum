import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "../lib/cx";

export type ModalProps = {
  open: boolean;
  /** 넘기지 않으면 닫을 수 없는 모달이 된다 */
  onClose?: () => void;
  title?: ReactNode;
  /** 제목 아래 작은 보조 문구 */
  caption?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** 좁은 화면에서 바닥에 붙는 시트로 뜬다 */
  sheetOnMobile?: boolean;
  className?: string;
};

/**
 * 화면 가운데 뜨는 패널. 좁은 화면에서는 바닥 시트로 바뀐다.
 * Escape 와 배경 클릭으로 닫히고, 열려 있는 동안 뒤쪽 스크롤을 막는다.
 */
export function Modal({
  open,
  onClose,
  title,
  caption,
  children,
  footer,
  sheetOnMobile = true,
  className,
}: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 입력칸이 있으면 거기로, 없으면 패널로 초점을 보낸다
    const field = panel.current?.querySelector<HTMLElement>(
      "input:not([type=hidden]), textarea, select",
    );
    (field ?? panel.current)?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-scrim"
      onClick={onClose ? () => onClose() : undefined}
      role="presentation"
    >
      <div
        ref={panel}
        className={cx("modal", sheetOnMobile && "sheet", className)}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {onClose ? (
          <button className="modal-close" type="button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        ) : null}

        {title ? <h2 className="modal-title">{title}</h2> : null}
        {caption ? <p className="modal-caption">{caption}</p> : null}

        <div className="modal-body">{children}</div>

        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
