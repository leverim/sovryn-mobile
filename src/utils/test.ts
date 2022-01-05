type Item = {
  id: number;
  network: string;
};

export type Lit = string | number | boolean | undefined | null | void | {};
export const tuple = <T extends Lit[]>(...args: T) => args;

function checkItems<S extends string>(arr: (Item & { network: S })[]) {
  return arr;
}

const list: Item[] = [
  { id: 1, network: 'eth' },
  { id: 30, network: 'rsk' },
];

const items = checkItems(list);

type T1 = typeof items[number]['network'];

const fn = (a: T1) => console.log(a);

fn('rssk');

type B = Pick<Item, 'network'>;
