import { SceneArt, STORY, endingOf, type NodeId } from "~/entities/act";
import { Panel } from "~/shared/ui";

/** 파티가 도달한 엔딩. 지나온 길을 함께 보여준다. */
export function EndingScroll({ nodeId, path }: { nodeId: NodeId; path: NodeId[] }) {
  const ending = endingOf(nodeId);
  if (!ending) return null;

  const trail = path.filter((id) => STORY[id]);

  return (
    <>
      <p className="eyebrow">
        <span className="n">엔딩</span>
        {trail.length}개의 갈림길을 지나
      </p>

      <div className="vn">
        <SceneArt name={ending.scene} />
        <div className="talk">
          <span className="who">엔딩</span>
          <p className="said">{ending.title}</p>
        </div>
      </div>

      <Panel className="ending-body">
        {ending.script.map((line, i) => (
          <p className="ending-line" key={i}>
            {line.speaker ? <b>{line.speaker}: </b> : null}
            {line.text}
          </p>
        ))}
        <p className="ending-epilogue">{ending.epilogue}</p>
      </Panel>

      <Panel title="파티가 지나온 길">
        <ol className="trail">
          {trail.map((id) => (
            <li key={id}>
              <span className="trail-dot" />
              <span>{STORY[id].when}</span>
            </li>
          ))}
          <li className="trail-end">
            <span className="trail-dot" />
            <span>{ending.title}</span>
          </li>
        </ol>
      </Panel>
    </>
  );
}
