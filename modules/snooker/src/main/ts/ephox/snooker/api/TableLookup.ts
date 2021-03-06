import { Arr, Fun, Optional } from '@ephox/katamari';
import { SelectorFilter, SelectorFind, Selectors, SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import { getAttrValue } from '../util/CellUtils';
import * as LayerSelector from '../util/LayerSelector';
import * as Structs from './Structs';

// lookup inside this table
const lookup = <T extends Element = Element> (tags: string[], element: SugarElement, isRoot: (e: SugarElement) => boolean = Fun.never): Optional<SugarElement<T>> => {
  // If the element we're inspecting is the root, we definitely don't want it.
  if (isRoot(element)) {
    return Optional.none();
  }
  // This looks a lot like SelectorFind.closest, with one big exception - the isRoot check.
  // The code here will look for parents if passed a table, SelectorFind.closest with that specific isRoot check won't.
  if (Arr.contains(tags, SugarNode.name(element))) {
    return Optional.some(element);
  }

  const isRootOrUpperTable = (elm: SugarElement) => Selectors.is(elm, 'table') || isRoot(elm);

  return SelectorFind.ancestor(element, tags.join(','), isRootOrUpperTable);
};

/*
 * Identify the optional cell that element represents.
 */
const cell = (element: SugarElement, isRoot?: (e: SugarElement) => boolean) => lookup<HTMLTableCellElement>([ 'td', 'th' ], element, isRoot);

const cells = (ancestor: SugarElement): SugarElement<HTMLTableCellElement>[] => LayerSelector.firstLayer(ancestor, 'th,td');

const notCell = (element: SugarElement, isRoot?: (e: SugarElement) => boolean) => lookup<Element>([ 'caption', 'tr', 'tbody', 'tfoot', 'thead' ], element, isRoot);

const neighbours = <T extends Element = Element> (selector: string) => (element: SugarElement): Optional<SugarElement<T>[]> =>
  Traverse.parent(element).map((parent) => SelectorFilter.children(parent, selector));

const neighbourCells = neighbours<HTMLTableCellElement>('th,td');
const neighbourRows = neighbours<HTMLTableRowElement>('tr');

const firstCell = (ancestor: SugarElement) => SelectorFind.descendant<HTMLTableCellElement>(ancestor, 'th,td');

const table = (element: SugarElement, isRoot?: (e: SugarElement) => boolean) => SelectorFind.closest<HTMLTableElement>(element, 'table', isRoot);

const row = (element: SugarElement, isRoot?: (e: SugarElement) => boolean) => lookup<HTMLTableRowElement>([ 'tr' ], element, isRoot);

const rows = (ancestor: SugarElement): SugarElement<HTMLTableRowElement>[] => LayerSelector.firstLayer(ancestor, 'tr');

const attr = (element: SugarElement, property: string) => getAttrValue(element, property);

const grid = (element: SugarElement, rowProp: string, colProp: string) => {
  const rowsCount = attr(element, rowProp);
  const cols = attr(element, colProp);
  return Structs.grid(rowsCount, cols);
};

export {
  cell,
  firstCell,
  cells,
  neighbourCells,
  table,
  row,
  rows,
  notCell,
  neighbourRows,
  attr,
  grid
};
