import type { ActionFunctionArgs } from "react-router";
import { requireHostPassword } from "~/entities/room/api/host.server";
import { createRoomState, newKey, newRoomCode, store } from "~/entities/room/api/store.server";

/** 새 방을 만들고 진행자 키를 돌려준다. 비밀번호를 아는 사람만 열 수 있다. */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") throw new Response("Method not allowed", { status: 405 });

  const { password } = (await request.json()) as { password?: string };
  requireHostPassword(password);

  const room = newRoomCode();
  const hostKey = newKey();

  await createRoomState(room);
  await store().setHostKey(room, hostKey);

  return Response.json({ room, hostKey });
}
