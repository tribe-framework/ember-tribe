import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TYPE_COLOR } from './arc-diagram';

// Canonical display order for node types
const TYPE_ORDER = ['route', 'service', 'type', 'helper', 'modifier', 'component'];

export default class StorylangIndexComponent extends Component {
  @tracked selectedNode = null;

  get legendItems() {
    return TYPE_ORDER.map(t => ({
      type:  t,
      label: t + 's',
      color: TYPE_COLOR[t] ?? '#8895a7',
    }));
  }

  get filterTypes() {
    return ['all', 'components', 'routes', 'services', 'types', 'helpers', 'modifiers'];
  }

  get allNodes() {
    const model = this.args.model;
    if (!model) return [];

    const nodes = [];

    const addNodes = (items, type) => {
      if (!items) return;
      items.forEach(item => {
        nodes.push({
          id: `${type}:${item.slug}`,
          slug: item.slug,
          type,
          data: item,
        });
      });
    };

    // Add in canonical order so the arc diagram always renders them top-to-bottom
    // as: routes → services → types → helpers → modifiers → components
    addNodes(model.routes,    'route');
    addNodes(model.services,  'service');
    addNodes(model.types,     'type');
    addNodes(model.helpers,   'helper');
    addNodes(model.modifiers, 'modifier');
    addNodes(model.components,'component');

    return nodes;
  }

  get filteredNodes() {
    return this.allNodes;
  }

  get allEdges() {
    const nodes = this.allNodes;
    const nodeIndex = {};
    nodes.forEach((n, i) => { nodeIndex[n.slug] = i; });

    const edges = [];
    const model = this.args.model;

    const addEdges = (item, itemType) => {
      const sourceSlug = item.slug;

      if (item.services) {
        item.services.forEach(svc => {
          edges.push({ source: sourceSlug, target: svc, kind: 'service', sourceType: itemType });
        });
      }

      if (item.components) {
        item.components.forEach(comp => {
          edges.push({ source: sourceSlug, target: comp, kind: 'component', sourceType: itemType });
        });
      }
    };

    (model?.components || []).forEach(c => addEdges(c, 'component'));
    (model?.routes     || []).forEach(r => addEdges(r, 'route'));
    (model?.services   || []).forEach(s => addEdges(s, 'service'));

    return edges;
  }

  get selectedNodeEdges() {
    if (!this.selectedNode) return [];
    return this.allEdges.filter(
      e => e.source === this.selectedNode.slug || e.target === this.selectedNode.slug
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
}
