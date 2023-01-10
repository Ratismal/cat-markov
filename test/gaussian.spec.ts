import Markov from '../src';
import { expect } from 'chai';
import 'mocha';

describe('Gaussian Markov', () => {
  let markov: Markov;

  it('should seed gaussian', () => {
    markov = new Markov([]);

    markov.seed('one two three one three two one three three two two one three one one one one one two');
    markov.seed('two three one two one three two one three two one one one one one one two');

    const key = markov.getKey('one');
    const dist = key.curve.gaussian;

    expect(dist.mean).to.eq(6);
    expect(dist.standardDeviation).to.eq(5);
    expect(dist.variance).to.eq(25);
  });

  it('should seed drastic gaussian', () => {
    markov = new Markov([]);

    markov.seed('one two three one three two one three three two two one three one one one one one two');
    markov.seed('one one one one one one one one one one one one one one one one one one one one');
    markov.seed('one one one one one one one one one one one one one one one one one one one one');
    markov.seed('one one one one one one one one one one one one one one one one one one one one');
    markov.seed('one one one one one one one one one one one one one one one one one one one one');
    markov.seed('one one one one one one one one one one one one one one one one one one one one');
    markov.seed('one one one one one one one one one one one one one one one one one one one one');
    markov.seed('one one one one one one one one one one one one one one one one one one one one');
    markov.seed('one one one one one one one one one one one one one one one one one one one one');
    markov.seed('two three one two one three two one three two one one one one one one two');

    const key = markov.getKey('one');
    const dist = key.curve.gaussian;

    expect(dist.mean).to.eq(44.5);
    expect(dist.standardDeviation).to.eq(157);
    expect(dist.variance).to.eq(24649);
  });
});