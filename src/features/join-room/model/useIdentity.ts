import { useCallback, useEffect, useState } from "react";
import { randomId, readLocal, writeLocal } from "~/shared/lib";

const PID_KEY = "strum:pid";
const NAME_KEY = "strum:name";

/** 로그인 대신 쓰는 기기별 신원. 이름은 사람이 직접 정한다. */
export function useIdentity() {
  const [pid, setPid] = useState<string | null>(null);
  const [name, setNameState] = useState("");

  useEffect(() => {
    let id = readLocal(PID_KEY);
    if (!id) {
      id = randomId();
      writeLocal(PID_KEY, id);
    }
    setPid(id);
    setNameState(readLocal(NAME_KEY) ?? "");
  }, []);

  const setName = useCallback((next: string) => {
    setNameState(next);
    writeLocal(NAME_KEY, next);
  }, []);

  return { pid, name, setName, ready: pid !== null };
}
