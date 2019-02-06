import Markov from '../src';
import { expect } from 'chai';
import 'mocha';

describe('Markov', () => {
  let markov: Markov;
  it('should instantiate', () => {
    markov = new Markov(['a', 'b', 'c']);

    expect(markov);
  });

  it('should seed', () => {
    markov.seed('one two three four five');
    markov.seed('six seven eight nine ten');

    // account for start and end keys
    expect(markov.size).to.equal(12);
  });

  it('should generate forwards', () => {
    let keys = markov.forward('one');

    expect(keys.map(k => k.toString()).join(' ')).to.equal('one two three four five');
  });

  it('should generate backwards', () => {
    let keys = markov.backward('five');

    expect(keys.map(k => k.toString()).join(' ')).to.equal('one two three four five');
  });

  it('should fill', () => {
    let keys = markov.fill('three');

    expect(keys.map(k => k.toString()).join(' ')).to.equal('one two three four five');
  });

  it('should create', () => {
    let keys = markov.create();

    expect(keys.map(k => k.toString()).join(' ')).to.be.oneOf([
      'one two three four five', 'six seven eight nine ten'
    ]);
  });
});