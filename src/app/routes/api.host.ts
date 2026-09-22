import type { ActionFunctionArgs } from "react-router";
import { requireHostPassword } from "~/entities/room/api/host.server";
import { requireRoom, store } from "~/entities/room/api/store.server";

/**
 * 이미 있는 방의 진행자 자리를 이어받는다.
 * 진행자가 기기를 바꿨을 때 쓴다. 비밀번호를 알아야 한다.
 */
export async function action({ params, request }: ActionFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const { password } = (await request.json()) as { password?: string };
  requireHostPassword(password);

  await requireRoom(room);

  const hostKey = await store().getHostKey(room);
  if (!hostKey) throw new Response("이 방에는 진행자 키가 없습니다.", { status: 404 });

  return Response.json({ hostKey });
}
