import { useEffect, useState } from "react";
import { readLocal, writeLocal } from "~/shared/lib";

const keyFor = (room: string) => `strum:host:${room}`;

/**
 * 진행자 키. 방을 만든 기기에 저장되고, ?k= 로 들어와도 저장된다.
 * 키가 없으면 그 화면에서는 진행자 조작이 잠긴다.
 */
export function useHostKey(room: string) {
  const [hostKey, setHostKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("k");
    if (fromUrl) {
      writeLocal(keyFor(room), fromUrl);
      window.history.replaceState({}, "", window.location.pathname);
      setHostKey(fromUrl);
    } else {
      setHostKey(readLocal(keyFor(room)));
    }
    setReady(true);
  }, [room]);

  return { hostKey, ready, setHostKey };
}

export const rememberHostKey = (room: string, key: string) => writeLocal(keyFor(room), key);
