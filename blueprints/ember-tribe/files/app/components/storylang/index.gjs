import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { SkipCache } from '@warp-drive/core/types/request';
import ArcDiagram, { TYPE_COLOR } from './arc-diagram';
import NodeDetail from './node-detail';
import didInsert from '../../modifiers/did-insert';
import setStyle from '../../modifiers/set-style';
import './index.css';

const TYPE_ORDER = [
  'route',
  'service',
  'type',
  'helper',
  'modifier',
  'component',
];

export default class StorylangIndexComponent extends Component {
  @service store;

  @tracked selectedNode = null;
  @tracked model = null;
  @tracked isLoading = true;
  @tracked isEmpty = false;

  @action
  async loadModel() {
    try {
      const { content: data } = await this.store.request({
        url: '/storylang.json',
        method: 'GET',
        cacheOptions: { [SkipCache]: true },
      });

      const hasContent =
        data &&
        [
          'routes',
          'services',
          'types',
          'helpers',
          'modifiers',
          'components',
        ].some((key) => Array.isArray(data[key]) && data[key].length > 0);

      if (hasContent) {
        this.model = data;
      } else {
        this.isEmpty = true;
      }
    } catch {
      this.isEmpty = true;
    } finally {
      this.isLoading = false;
    }
  }

  get legendItems() {
    return TYPE_ORDER.map((t) => ({
      type: t,
      label: t + 's',
      color: TYPE_COLOR[t] ?? '#8895a7',
    }));
  }

  get allNodes() {
    const model = this.model;
    if (!model) return [];

    const nodes = [];

    const addNodes = (items, type) => {
      if (!items) return;
      items.forEach((item) => {
        nodes.push({
          id: `${type}:${item.slug}`,
          slug: item.slug,
          type,
          data: item,
        });
      });
    };

    addNodes(model.routes, 'route');
    addNodes(model.services, 'service');
    addNodes(model.types, 'type');
    addNodes(model.helpers, 'helper');
    addNodes(model.modifiers, 'modifier');
    addNodes(model.components, 'component');

    return nodes;
  }

  get filteredNodes() {
    return this.allNodes;
  }

  get allEdges() {
    const nodes = this.allNodes;
    const nodeIndex = {};
    nodes.forEach((n, i) => {
      nodeIndex[n.slug] = i;
    });

    const edges = [];
    const model = this.model;

    const addEdges = (item, itemType) => {
      const sourceSlug = item.slug;

      if (item.services) {
        item.services.forEach((svc) => {
          edges.push({
            source: sourceSlug,
            target: svc,
            kind: 'service',
            sourceType: itemType,
          });
        });
      }

      if (item.components) {
        item.components.forEach((comp) => {
          edges.push({
            source: sourceSlug,
            target: comp,
            kind: 'component',
            sourceType: itemType,
          });
        });
      }
    };

    (model?.components || []).forEach((c) => addEdges(c, 'component'));
    (model?.routes || []).forEach((r) => addEdges(r, 'route'));
    (model?.services || []).forEach((s) => addEdges(s, 'service'));

    return edges;
  }

  get selectedNodeEdges() {
    if (!this.selectedNode) return [];
    return this.allEdges.filter(
      (e) =>
        e.source === this.selectedNode.slug ||
        e.target === this.selectedNode.slug,
    );
  }

  @action
  selectNode(node) {
    if (this.selectedNode?.id === node.id) {
      this.selectedNode = null;
    } else {
      this.selectedNode = node;
    }
  }

  @action
  clearSelection() {
    this.selectedNode = null;
  }

  <template>
    {{#if this.isEmpty}}

      <div
        class="bg-white vh-100 w-100 d-flex align-items-center justify-content-center flex-column"
      >
        <h1 class="display-6">Welcome to Tribe</h1>
        <p class="lead">You have successfully installed
          <strong>ember-tribe</strong></p>
        <a
          href="https://tribe-framework.org"
          class="btn btn-success"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read more about Tribe
        </a>
      </div>

    {{else}}
      <div class="sl-root">

        <header class="sl-header">
          <h1>
            Storylang
          </h1>

          <div class="sl-legend">
            {{#each this.legendItems as |item|}}
              <div class="sl-legend-item">
                <span
                  class="sl-legend-dot"
                  {{setStyle background=item.color}}
                ></span>
                {{item.label}}
              </div>
            {{/each}}
          </div>
        </header>

        <div class="sl-body">

          <div class="sl-diagram-wrap">
            <div class="sl-svg-container">
              <ArcDiagram
                @nodes={{this.filteredNodes}}
                @edges={{this.allEdges}}
                @selectedNode={{this.selectedNode}}
                @onSelectNode={{this.selectNode}}
              />
            </div>
          </div>

          <aside class="sl-panel">
            {{#if this.selectedNode}}
              <NodeDetail
                @node={{this.selectedNode}}
                @edges={{this.selectedNodeEdges}}
                @onClose={{this.clearSelection}}
                @onNavigate={{this.selectNode}}
                @allNodes={{this.allNodes}}
              />
            {{else}}
              <div class="sl-panel-empty">
                <p>Click any node on the diagram to inspect its connections and
                  properties.</p>
              </div>
            {{/if}}
          </aside>

        </div>
      </div>

    {{/if}}

    <div {{didInsert this.loadModel}}></div>
  </template>
}
