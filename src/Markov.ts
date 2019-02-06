export enum SpecialKey {
  NORMAL_KEY = 1,
  START_KEY = 2,
  END_KEY = 3
}

export class MarkovAssociation {
  public keyRef: MarkovKey;
  public get key() {
    return this.keyRef.key;
  }
  public associations: number;

  constructor(key: MarkovKey) {
    this.keyRef = key;
    this.associations = 1;
  }
}

export class MarkovKey {
  public key: string | SpecialKey;
  public links: Map<string | SpecialKey, MarkovAssociation>;
  public parents: Map<string | SpecialKey, MarkovAssociation>;
  public output: string[];
  private weightSum: number;
  private parentWeightSum: number;

  constructor(key: string | SpecialKey) {
    this.links = new Map<string, MarkovAssociation>();
    this.parents = new Map<string, MarkovAssociation>();
    this.output = [];
    if (typeof key === 'string') {
      this.output.push(key);
      this.key = this.sanitize(key);
    } else this.key = key;

    this.weightSum = 0;
    this.parentWeightSum = 0;
  }

  // sanitize keys, meaning that punctuation becomes interchangeable
  sanitize(key: string): string {
    // could possibly also lowercase?
    return key.replace(/[^a-z\d]/g, '');
  }

  addLink(key: MarkovKey) {
    if (this.links.has(key.key)) this.links.get(key.key).associations++;
    else {
      const ass: MarkovAssociation = new MarkovAssociation(key);
      this.links.set(ass.key, ass);
    }
    this.weightSum++;
  }

  addParent(key: MarkovKey) {
    if (this.parents.has(key.key)) this.parents.get(key.key).associations++;
    else {
      const ass: MarkovAssociation = new MarkovAssociation(key);
      this.parents.set(ass.key, ass);
    }
    this.parentWeightSum++;
  }

  next(): MarkovKey {
    const seed: number = Math.floor(Math.random() * this.weightSum);
    let accu: number = 0;
    for (const ass of this.links.values()) {
      accu += ass.associations;
      if (accu >= seed) return ass.keyRef;
    }
  }

  randNext(): MarkovKey {
    const asses = Array.from(this.links.values());
    return asses[Math.floor(Math.random() * asses.length)].keyRef;
  }

  prev(): MarkovKey {
    const seed: number = Math.floor(Math.random() * this.parentWeightSum);
    let accu: number = 0;
    for (const ass of this.parents.values()) {
      accu += ass.associations;
      if (accu >= seed) return ass.keyRef;
    }
  }

  randPrev(): MarkovKey {
    const asses = Array.from(this.parents.values());
    return asses[Math.floor(Math.random() * asses.length)].keyRef;
  }

  toString(): string {
    return this.output[Math.floor(Math.random() * this.output.length)];
  }
}

export type MarkovKeyable = MarkovKey | string | SpecialKey;

export default class Markov {
  public names?: string[];
  private data: Map<string | SpecialKey, MarkovKey>;
  private startKey: MarkovKey;
  private endKey: MarkovKey;

  constructor(names?: string[]) {
    this.names = names;
    this.data = new Map<string | SpecialKey, MarkovKey>();

    this.startKey = new MarkovKey(SpecialKey.START_KEY);
    this.endKey = new MarkovKey(SpecialKey.END_KEY);
    this.addKey(this.startKey);
    this.addKey(this.endKey);
  }

  get size() {
    return this.data.size;
  }

  private addKey(key: MarkovKey) {
    if (!this.data.has(key.key)) this.data.set(key.key, key);
  }

  private getOrCreateKey(key: string) {
    if (!this.data.has(key)) this.data.set(key, new MarkovKey(key));
    return this.data.get(key);
  }

  seed(s: string | string[]) {
    if (typeof s === 'string') {
      const components: string[] = s.split(/\s+/);
      let lastKey: MarkovKey = this.startKey;
      for (const comp of components) {
        const key: MarkovKey = this.getOrCreateKey(comp);
        lastKey.addLink(key);
        key.addParent(lastKey);
        lastKey = key;
      }
      lastKey.addLink(this.endKey);
    } else if (Array.isArray(s)) {
      for (const line of s) {
        this.seed(line);
      }
    }
  }

  public create(minLimit?: number, maxLimit?: number): string[] {
    let keys: MarkovKey[];

    let tries: number = 0;
    do {
      keys = [];
      let key: MarkovKey = this.startKey.next();
      do {
        keys.push(key);
        key = key.next();
      } while (key.key !== SpecialKey.END_KEY);
    } while (
      ((minLimit && keys.length < minLimit) || (maxLimit && keys.length > maxLimit))
      && (++tries <= 10)
    );

    return keys.filter(k => typeof k.key === 'string').map(k => k.toString());
  }

  public pick(): MarkovKey {
    const keys = Array.from(this.data.values());
    return keys[Math.floor(Math.random() * keys.length)];
  }

  public getKey(key: MarkovKeyable): MarkovKey {
    let rkey: MarkovKey;
    if (key instanceof MarkovKey) {
      rkey = key;
    } else {
      rkey = this.data.get(key);
    }
    if (!rkey) throw new Error('Key not found');
    return rkey;
  }

  public next(key: MarkovKeyable): MarkovKey {
    return this.getKey(key).next();
  }

  public nextRand(key: MarkovKeyable) {
    return this.getKey(key).randNext();
  }

  public prev(key: MarkovKeyable): MarkovKey {
    return this.getKey(key).prev();
  }

  public randPrev(key: MarkovKeyable): MarkovKey {
    return this.getKey(key).randPrev();
  }

  public forward(key: MarkovKeyable, limit?: number, rand: boolean = false): MarkovKey[] {
    let rkey: MarkovKey = this.getKey(key);
    let i: number = 0;
    const keys: MarkovKey[] = [];
    do {
      keys.push(rkey);
      rkey = rkey[rand ? 'randNext' : 'next']();
      i++;
    } while (rkey.key !== SpecialKey.END_KEY && !(limit && i > limit));
    return keys;
  }

  public backward(key: MarkovKeyable, limit?: number, rand: boolean = false): MarkovKey[] {
    let rkey: MarkovKey = this.getKey(key);
    let i: number = 0;
    const keys: MarkovKey[] = [];
    do {
      keys.push(rkey);
      rkey = rkey[rand ? 'randPrev' : 'prev']();
      i++;
    } while (rkey.key !== SpecialKey.START_KEY && !(limit && i > limit));
    return keys.reverse();
  }

  public fill(key: MarkovKeyable, limit?: number, rand: boolean = false): MarkovKey[] {
    let rkey: MarkovKey = this.getKey(key);
    let i: number = 0;
    let keys: MarkovKey[] = this.backward(key, limit, rand);
    if (!limit || keys.length < limit) {
      keys.push(...this.forward(key, limit ? limit - keys.length : null, rand).slice(1));
    }
    return keys;
  }
}
