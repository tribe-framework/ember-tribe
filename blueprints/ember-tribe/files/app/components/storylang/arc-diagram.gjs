import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { modifier } from 'ember-modifier';
import didInsert from '../../modifiers/did-insert';
import './arc-diagram.css';

const RADIUS = 220;
const CENTER_X = 340;
const CENTER_Y = 340;
const SVG_SIZE = 680;
const DOT_R = 3.5;
const DOT_R_EDGE = 4.5;
const DOT_R_SEL = 5.5;
const LABEL_OFFSET = 18;
const ARC_PULL = 0.45;

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.12;

const INERTIA_FRICTION = 0.88;
const INERTIA_MIN_VEL = 0.03;

const TYPE_ORDER = [
  'route',
  'service',
  'type',
  'helper',
  'modifier',
  'component',
];

const onPointerDown = modifier((element, [handler]) => {
  element.addEventListener('pointerdown', handler);
  return () => element.removeEventListener('pointerdown', handler);
});

export const TYPE_COLOR = {
  component: '#4fc3f7',
  route: '#a78bfa',
  service: '#34d399',
  helper: '#fbbf24',
  modifier: '#f87171',
  type: '#fb923c',
};

export const EDGE_COLOR = {
  service: 'rgba(52,211,153,0.7)',
  component: 'rgba(79,195,247,0.6)',
};

function polarToXY(angleDeg, r, cx = CENTER_X, cy = CENTER_Y) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function pointerAngle(svgEl, clientX, clientY) {
  const rect = svgEl.getBoundingClientRect();
  const scaleX = SVG_SIZE / rect.width;
  const scaleY = SVG_SIZE / rect.height;
  const dx = (clientX - rect.left) * scaleX - CENTER_X;
  const dy = (clientY - rect.top) * scaleY - CENTER_Y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export default class StorylangArcDiagramComponent extends Component {
  @tracked rotationDeg = 0;
  @tracked zoomScale = 1;

  _isDragging = false;
  _dragStartAngle = 0;
  _dragStartRot = 0;
  _lastAngle = 0;
  _velocity = 0;
  _dragMoved = false;
  _rafId = null;
  _svgEl = null;
  _pendingNodeClick = null;

  get nodes() {
    return [...(this.args.nodes ?? [])].sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a.type);
      const bi = TYPE_ORDER.indexOf(b.type);
      return (
        (ai === -1 ? TYPE_ORDER.length : ai) -
        (bi === -1 ? TYPE_ORDER.length : bi)
      );
    });
  }

  get edges() {
    const slugSet = new Set(this.nodes.map((n) => n.slug));
    return (this.args.edges ?? []).filter(
      (e) => slugSet.has(e.source) && slugSet.has(e.target),
    );
  }

  get selectedSlug() {
    return this.args.selectedNode?.slug ?? null;
  }

  get viewBox() {
    return `0 0 ${SVG_SIZE} ${SVG_SIZE}`;
  }

  get ringTransform() {
    return `rotate(${this.rotationDeg}, ${CENTER_X}, ${CENTER_Y})`;
  }
  get zoomTransform() {
    const s = this.zoomScale;
    const tx = CENTER_X * (1 - s);
    const ty = CENTER_Y * (1 - s);
    return `translate(${tx}, ${ty}) scale(${s})`;
  }

  get angleStep() {
    const n = this.nodes.length;
    return n > 0 ? 360 / n : 0;
  }

  get nodeAngles() {
    const map = {};
    this.nodes.forEach((nd, i) => {
      map[nd.slug] = i * this.angleStep;
    });
    return map;
  }

  get typeGroups() {
    const nodes = this.nodes;
    const groups = [];
    let i = 0;
    while (i < nodes.length) {
      const t = nodes[i].type;
      let j = i;
      while (j < nodes.length && nodes[j].type === t) j++;
      groups.push({ type: t, startIdx: i, endIdx: j - 1 });
      i = j;
    }
    return groups;
  }

  get typeGroupArcs() {
    const step = this.angleStep;
    const R = RADIUS + 14;
    const r = RADIUS + 6;

    return this.typeGroups.map((g) => {
      const startAngle = g.startIdx * step - step * 0.45;
      const endAngle = g.endIdx * step + step * 0.45;
      const midAngle = (startAngle + endAngle) / 2;

      const s1 = polarToXY(startAngle, R);
      const s2 = polarToXY(startAngle, r);
      const e1 = polarToXY(endAngle, R);
      const e2 = polarToXY(endAngle, r);

      const largeArc = endAngle - startAngle > 180 ? 1 : 0;

      const path =
        `M ${s2.x} ${s2.y}` +
        ` A ${r} ${r} 0 ${largeArc} 1 ${e2.x} ${e2.y}` +
        ` L ${e1.x} ${e1.y}` +
        ` A ${R} ${R} 0 ${largeArc} 0 ${s1.x} ${s1.y}` +
        ` Z`;

      const lp = polarToXY(midAngle, R + 12);
      const isLeftSide = midAngle % 360 > 180;
      const anchor = isLeftSide ? 'end' : 'start';
      const anchorFinal =
        Math.abs((midAngle % 360) - 180) < 20 ||
        midAngle % 360 < 20 ||
        midAngle % 360 > 340
          ? 'middle'
          : anchor;
      const segLabelRotate = isLeftSide
        ? (midAngle % 360) + 90
        : (midAngle % 360) - 90;

      return {
        type: g.type,
        path,
        color: TYPE_COLOR[g.type] ?? '#8895a7',
        labelX: lp.x,
        labelY: lp.y,
        label: g.type.toUpperCase() + 'S',
        anchor: anchorFinal,
        labelRotate: segLabelRotate,
      };
    });
  }

  get nodeDisplayList() {
    const { nodes, edges, selectedSlug, nodeAngles, rotationDeg } = this;

    return nodes.map((nd) => {
      const angle = nodeAngles[nd.slug];
      const pos = polarToXY(angle, RADIUS);
      const labelPos = polarToXY(angle, RADIUS + LABEL_OFFSET);

      const isSelected = nd.slug === selectedSlug;
      const inEdge =
        selectedSlug != null &&
        edges.some(
          (e) =>
            (e.source === selectedSlug && e.target === nd.slug) ||
            (e.target === selectedSlug && e.source === nd.slug),
        );
      const isDimmed = selectedSlug != null && !isSelected && !inEdge;
      const color = TYPE_COLOR[nd.type] ?? '#8895a7';

      const effectiveAngle = (((angle + rotationDeg) % 360) + 360) % 360;
      const isLeftHalf = effectiveAngle > 180;

      const svgAngle = angle - 90;
      const labelRotate = String(isLeftHalf ? svgAngle + 180 : svgAngle);
      const textAnchor = isLeftHalf ? 'end' : 'start';

      return {
        node: nd,
        cx: pos.x,
        cy: pos.y,
        labelX: labelPos.x,
        labelY: labelPos.y,
        labelRotate,
        textAnchor,
        isSelected,
        inEdge,
        isDimmed,
        color,
        dotR: isSelected ? DOT_R_SEL : inEdge ? DOT_R_EDGE : DOT_R,
        dotOpacity: isDimmed ? 0.15 : 1,
        labelFill: isSelected ? '#f0f6fc' : inEdge ? '#c9d1d9' : '#6e7c8a',
        labelWeight: isSelected ? 600 : 400,
        groupClass: `sl-node-group${isSelected ? ' active' : ''}${isDimmed ? ' dimmed' : ''}`,
      };
    });
  }

  get arcDisplayList() {
    const { edges, nodeAngles, selectedSlug } = this;

    return edges
      .map((e) => {
        const a1 = nodeAngles[e.source];
        const a2 = nodeAngles[e.target];
        if (a1 == null || a2 == null) return null;

        const p1 = polarToXY(a1, RADIUS);
        const p2 = polarToXY(a2, RADIUS);

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const cpx = CENTER_X + (mx - CENTER_X) * (1 - ARC_PULL);
        const cpy = CENTER_Y + (my - CENTER_Y) * (1 - ARC_PULL);

        const path = `M ${p1.x} ${p1.y} Q ${cpx} ${cpy} ${p2.x} ${p2.y}`;

        const isHighlighted =
          selectedSlug != null &&
          (e.source === selectedSlug || e.target === selectedSlug);
        const isDimmed = selectedSlug != null && !isHighlighted;

        return {
          path,
          stroke: EDGE_COLOR[e.kind] ?? 'rgba(200,200,200,0.4)',
          strokeWidth: isHighlighted ? 1.8 : 1,
          arcClass: `sl-arc-path${isDimmed ? ' dimmed' : isHighlighted ? ' highlighted' : ' default'}`,
        };
      })
      .filter(Boolean);
  }

  get cx() {
    return CENTER_X;
  }
  get cy() {
    return CENTER_Y;
  }

  _applyZoom(newScale) {
    this.zoomScale = clamp(newScale, ZOOM_MIN, ZOOM_MAX);
  }

  @action
  zoomIn() {
    this._applyZoom(this.zoomScale * (1 + ZOOM_STEP));
  }

  @action
  zoomOut() {
    this._applyZoom(this.zoomScale * (1 - ZOOM_STEP));
  }

  @action
  zoomReset() {
    this.zoomScale = 1;
  }

  _cancelInertia() {
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _startInertia() {
    this._cancelInertia();
    const tick = () => {
      this._velocity *= INERTIA_FRICTION;
      if (Math.abs(this._velocity) < INERTIA_MIN_VEL) {
        this._velocity = 0;
        this._rafId = null;
        return;
      }
      this.rotationDeg = this.rotationDeg + this._velocity;
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  @action
  registerSvg(el) {
    this._svgEl = el;
  }

  @action
  handlePointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;

    this._cancelInertia();
    this._isDragging = true;
    this._dragMoved = false;
    this._velocity = 0;
    this._pendingNodeClick =
      event.target?.closest?.('[data-node-slug]')?.dataset?.nodeSlug ?? null;

    const angle = pointerAngle(this._svgEl, event.clientX, event.clientY);
    this._dragStartAngle = angle;
    this._dragStartRot = this.rotationDeg;
    this._lastAngle = angle;

    this._svgEl.setPointerCapture(event.pointerId);
  }

  @action
  handlePointerMove(event) {
    if (!this._isDragging) return;

    const angle = pointerAngle(this._svgEl, event.clientX, event.clientY);

    let delta = angle - this._dragStartAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    this.rotationDeg = this._dragStartRot + delta;

    if (Math.abs(delta) > 3) this._dragMoved = true;
  }

  @action
  handlePointerUp(event) {
    if (!this._isDragging) return;
    this._isDragging = false;
    this._svgEl.releasePointerCapture(event.pointerId);

    if (!this._dragMoved && this._pendingNodeClick) {
      const nd = this.nodes.find((n) => n.slug === this._pendingNodeClick);
      if (nd) this.args.onSelectNode?.(nd);
    }
    this._pendingNodeClick = null;
  }

  <template>
    <div class="sl-arc-wrapper">

      <div class="sl-zoom-controls">
        <button
          class="sl-zoom-btn"
          type="button"
          {{on "click" this.zoomIn}}
          title="Zoom in"
        >+</button>
        <button
          class="sl-zoom-btn"
          type="button"
          {{on "click" this.zoomOut}}
          title="Zoom out"
        >−</button>
        <button
          class="sl-zoom-btn sl-zoom-reset"
          type="button"
          {{on "click" this.zoomReset}}
          title="Reset zoom"
        >1:1</button>
      </div>

      <svg
        class="sl-arc-svg"
        viewBox={{this.viewBox}}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        {{didInsert this.registerSvg}}
        {{onPointerDown this.handlePointerDown}}
        {{on "pointermove" this.handlePointerMove}}
        {{on "pointerup" this.handlePointerUp}}
        {{on "pointercancel" this.handlePointerUp}}
      >

        <g class="sl-zoom-group" transform={{this.zoomTransform}}>

          <g class="sl-ring" transform={{this.ringTransform}}>

            {{#each this.typeGroupArcs as |seg|}}
              <path
                class="sl-type-ring-segment"
                d={{seg.path}}
                fill={{seg.color}}
              />
            {{/each}}

            <g class="sl-arcs">
              {{#each this.arcDisplayList as |arc|}}
                <path
                  class={{arc.arcClass}}
                  d={{arc.path}}
                  stroke={{arc.stroke}}
                  stroke-width={{arc.strokeWidth}}
                />
              {{/each}}
            </g>

            <g class="sl-nodes">
              {{#each this.nodeDisplayList as |item|}}
                <g class={{item.groupClass}} data-node-slug={{item.node.slug}}>
                  <circle
                    class="sl-node-hit"
                    cx={{item.cx}}
                    cy={{item.cy}}
                    r="12"
                    fill="transparent"
                  />
                  <circle
                    class="sl-node-dot"
                    cx={{item.cx}}
                    cy={{item.cy}}
                    r={{item.dotR}}
                    fill={{item.color}}
                    opacity={{item.dotOpacity}}
                  />
                  <text
                    class="sl-node-label"
                    x={{item.labelX}}
                    y={{item.labelY}}
                    fill={{item.labelFill}}
                    font-weight={{item.labelWeight}}
                    text-anchor={{item.textAnchor}}
                    transform="rotate({{item.labelRotate}}, {{item.labelX}}, {{item.labelY}})"
                  >{{item.node.slug}}</text>
                </g>
              {{/each}}
            </g>

          </g>
        </g>
      </svg>

    </div>
  </template>
}
