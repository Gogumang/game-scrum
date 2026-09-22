import { useEffect, useRef, useState } from "react";

export type TypewriterHandle = { finish: () => void };

export type TypewriterTextProps = {
  text: string;
  /** 글자당 밀리초 */
  speed?: number;
  /** true 면 애니메이션 없이 즉시 전부 보여준다 */
  instant?: boolean;
  className?: string;
  onDone?: () => void;
};

/**
 * 한 글자씩 찍어 보여준다.
 * prefers-reduced-motion 이면 자동으로 즉시 출력한다.
 */
export function TypewriterText({
  text,
  speed = 28,
  instant = false,
  className,
  onDone,
}: TypewriterTextProps) {
  const [shown, setShown] = useState(text);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (instant || reduced) {
      setShown(text);
      doneRef.current?.();
      return;
    }

    setShown("");
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(timer);
        doneRef.current?.();
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, speed, instant]);

  return <p className={className}>{shown}</p>;
}
