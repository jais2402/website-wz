// Where the lite home hero puts its framed loom: the free space beside (desktop) or above (phones) the intro
// panel, so the panel never covers it. The loom camera (LoomScene BoxRig) fits the whole machine into any box.

export type Box = { left: number; top: number; width: number; height: number }

/**
 * @param vw, vh viewport size; @param navBottom bottom edge of the header; @param panelRight right edge of the
 * widest copy panel (intro or phases); @param introTop top of the intro panel (phones).
 * Desktop: from 48px under the panel (its solid fill hides that edge) to the screen's right and bottom edges, so no
 * box edge is ever visible. Phones (< 900 px): the full-width strip between the header and the panel.
 */
export function liteBox(vw: number, vh: number, navBottom: number, panelRight: number, introTop: number): Box {
  if (vw < 900) {
    const top = navBottom + 4
    return { left: 0, top, width: vw, height: Math.max(0, introTop - 8 - top) }
  }
  const left = Math.max(0, panelRight - 48)
  return { left, top: 0, width: Math.max(0, vw - left), height: vh }
}
