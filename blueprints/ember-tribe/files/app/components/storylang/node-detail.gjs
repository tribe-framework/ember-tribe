import Component from '@glimmer/component';
import { action } from '@ember/object';
import { TYPE_COLOR, EDGE_COLOR } from './arc-diagram';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import setStyle from '../../modifiers/set-style';
import './node-detail.css';

export default class StorylangNodeDetailComponent extends Component {
  get typeColor() {
    return TYPE_COLOR[this.args.node?.type] ?? '#8895a7';
  }

  get badgeBackground() {
    return `${this.typeColor}22`;
  }

  get badgeBorder() {
    return `1px solid ${this.typeColor}44`;
  }

  get outgoingEdges() {
    const slug = this.args.node?.slug;
    return (this.args.edges ?? [])
      .filter((e) => e.source === slug)
      .map((e) => ({
        slug: e.target,
        kind: e.kind,
        arrowColor: EDGE_COLOR[e.kind] ?? '#8895a7',
        direction: 'out',
      }));
  }

  get incomingEdges() {
    const slug = this.args.node?.slug;
    return (this.args.edges ?? [])
      .filter((e) => e.target === slug)
      .map((e) => ({
        slug: e.source,
        kind: e.kind,
        arrowColor: EDGE_COLOR[e.kind] ?? '#8895a7',
        direction: 'in',
      }));
  }

  get hasConnections() {
    return this.outgoingEdges.length > 0 || this.incomingEdges.length > 0;
  }

  get sections() {
    const d = this.args.node?.data;
    if (!d) return [];

    const toItems = (arr, linked = false) =>
      (arr ?? []).map((a) => ({
        label: typeof a === 'string' ? a : Object.keys(a)[0],
        linked,
      }));

    return [
      { title: 'Tracked Vars', items: toItems(d.tracked_vars) },
      { title: 'Inherited Args', items: toItems(d.inherited_args) },
      { title: 'Getters', items: toItems(d.getters) },
      { title: 'Actions', items: toItems(d.actions) },
      { title: 'Functions', items: toItems(d.functions) },
      { title: 'Services', items: toItems(d.services, true) },
      { title: 'Components', items: toItems(d.components, true) },
      { title: 'Modifiers', items: toItems(d.modifiers) },
    ].filter((s) => s.items.length > 0);
  }

  @action
  navigateTo(slug) {
    const target = (this.args.allNodes ?? []).find((n) => n.slug === slug);
    if (target) this.args.onNavigate?.(target);
  }

  @action
  close() {
    this.args.onClose?.();
  }

  <template>
    {{#if @node}}
      <div class="sl-nd-root">

        <div class="sl-nd-head">

          <div class="sl-nd-head-row">
            <div>
              <div
                class="sl-nd-badge"
                {{setStyle
                  background=this.badgeBackground
                  color=this.typeColor
                  border=this.badgeBorder
                }}
              >
                <svg width="6" height="6">
                  <circle cx="3" cy="3" r="3" fill={{this.typeColor}} />
                </svg>
                {{@node.type}}
              </div>
              <div class="sl-nd-slug">{{@node.slug}}</div>
            </div>

            <button
              class="sl-nd-close"
              type="button"
              {{on "click" this.close}}
              title="Deselect"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          </div>

        </div>

        <div class="sl-nd-body">

          {{#if this.hasConnections}}
            <div class="sl-nd-section">
              <div class="sl-nd-section-title">Connections</div>

              {{#each this.outgoingEdges as |edge|}}
                <div class="sl-nd-conn-row">
                  <span
                    class="sl-nd-conn-arrow"
                    {{setStyle color=edge.arrowColor}}
                  >→</span>
                  <span class="sl-nd-conn-kind">{{edge.kind}}</span>
                  <span
                    class="sl-nd-conn-slug"
                    role="button"
                    {{on "click" (fn this.navigateTo edge.slug)}}
                  >{{edge.slug}}</span>
                </div>
              {{/each}}

              {{#each this.incomingEdges as |edge|}}
                <div class="sl-nd-conn-row">
                  <span
                    class="sl-nd-conn-arrow"
                    {{setStyle color=edge.arrowColor}}
                  >←</span>
                  <span class="sl-nd-conn-kind">{{edge.kind}}</span>
                  <span
                    class="sl-nd-conn-slug"
                    role="button"
                    {{on "click" (fn this.navigateTo edge.slug)}}
                  >{{edge.slug}}</span>
                </div>
              {{/each}}
            </div>
          {{/if}}

          {{#each this.sections as |section|}}
            <div class="sl-nd-section">
              <div class="sl-nd-section-title">{{section.title}}</div>
              <div class="sl-nd-tags">
                {{#each section.items as |item|}}
                  {{#if item.linked}}
                    <span
                      class="sl-nd-tag linked"
                      role="button"
                      {{on "click" (fn this.navigateTo item.label)}}
                    >{{item.label}}</span>
                  {{else}}
                    <span class="sl-nd-tag">{{item.label}}</span>
                  {{/if}}
                {{/each}}
              </div>
            </div>
          {{/each}}

        </div>

      </div>
    {{/if}}
  </template>
}
