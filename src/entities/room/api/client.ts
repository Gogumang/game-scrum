import { getJson, postJson } from "~/shared/lib";
import type { HostCommand, RoomPayload, Analysis } from "../model/types";

export const fetchRoom = (room: string, pid: string | null, hostKey?: string | null) => {
  const q = new URLSearchParams();
  if (pid) q.set("pid", pid);
  if (hostKey) q.set("k", hostKey);
  const query = q.toString();
  return getJson<RoomPayload>(`/api/room/${room}${query ? `?${query}` : ""}`);
};

export const createRoom = (password: string) =>
  postJson<{ room: string; hostKey: string }>("/api/rooms", { password });

/** 다른 기기에서 진행자 자리를 이어받는다 */
export const claimHost = (room: string, password: string) =>
  postJson<{ hostKey: string }>(`/api/room/${room}/host`, { password });

export const joinRoom = (room: string, pid: string, name: string) =>
  postJson<RoomPayload>(`/api/room/${room}/join`, { pid, name });

export const sendVote = (
  room: string,
  pid: string,
  name: string,
  nodeId: string,
  choice: number,
) => postJson<RoomPayload>(`/api/room/${room}/vote`, { pid, name, nodeId, choice });

export const sendCommand = (room: string, hostKey: string, command: HostCommand) =>
  postJson<RoomPayload>(`/api/room/${room}/control`, { hostKey, command });

export const requestAnalysis = (room: string, hostKey: string) =>
  postJson<{ analysis: Analysis | null; running?: boolean }>(`/api/room/${room}/analyze`, {
    hostKey,
  });
