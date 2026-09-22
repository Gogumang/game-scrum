import { Chip } from "~/shared/ui";
import { ELEMENTS } from "../model/fortune";
import type { Element } from "~/entities/act";

/** 오행 하나를 색과 한자로 보여준다. */
export function ElementChip({ element, withName = true }: { element: Element; withName?: boolean }) {
  const meta = ELEMENTS[element];
  return (
    <Chip color={meta.color} glyph={meta.han}>
      {withName ? meta.name : null}
    </Chip>
  );
}
