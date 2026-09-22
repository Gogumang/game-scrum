import QRCode from "qrcode";
import type { LoaderFunctionArgs } from "react-router";

/**
 * 참여 링크 QR 을 서버에서 만들어 내려보낸다.
 * 클라이언트 번들에 QR 라이브러리가 들어가지 않는다.
 */
export async function loader({ params, request }: LoaderFunctionArgs) {
  const room = (params.room ?? "").toUpperCase();
  const joinUrl = new URL(`/r/${room}`, request.url).toString();

  const qrSvg = await QRCode.toString(joinUrl, {
    type: "svg",
    margin: 0,
    color: { dark: "#3A2A20", light: "#0000" },
  });

  return { room, joinUrl, qrSvg };
}

export { HostPage as default } from "~/pages/host";
