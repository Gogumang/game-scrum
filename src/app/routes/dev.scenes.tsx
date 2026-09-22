import { ENDINGS, SceneArt, STORY } from "~/entities/act";
import { hasImage } from "~/entities/act/model/sceneImages";

/**
 * 장면 아트 확인용 갤러리. 개발 중에만 열립니다.
 * 그림을 손볼 때 /dev/scenes 를 띄워두면 전부 한 번에 볼 수 있습니다.
 */
export function loader() {
  if (!import.meta.env.DEV) throw new Response("Not found", { status: 404 });
  return null;
}

export default function SceneGallery() {
  const rows = [
    ...Object.values(STORY).map((n) => ({ id: n.id, scene: n.scene, when: n.when, act: n.act })),
    ...Object.values(ENDINGS).map((e) => ({ id: e.id, scene: e.scene, when: e.title, act: e.act })),
  ].sort((a, b) => a.act - b.act);

  return (
    <div className="app">
      <div className="cols solo" style={{ paddingBottom: 60 }}>
        <main>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, margin: "20px 0 18px" }}>
            장면 아트 갤러리 · {rows.length}장
          </h1>
          {rows.map((row) => (
            <div key={row.id} style={{ marginBottom: 26 }}>
              <p className="eyebrow">
                <span className="n">{row.act <= 5 ? `제 ${row.act} 막` : "엔딩"}</span>
                {row.when} · {row.scene} · {hasImage(row.scene) ? "이미지" : "벡터"}
              </p>
              <div className="vn">
                <SceneArt name={row.scene} />
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
