# Cat-Markov

A markov chain generator.

## Installation

### NPM

```
npm i --save cat-markov
```

### Yarn

```
yarn add cat-markov
```

## Usage

### JavaScript

```js
const Markov = require('cat-markov').default;
const markov = new Markov();
markov.seed(['an array', 'of strings', 'to populate', 'the markov with']);
const keys = markov.create();
```

### TypeScript

```ts
import Markov from 'cat-markov';
const markov = new Markov();
markov.seed(['an array', 'of strings', 'to populate', 'the markov with']);
const keys = markov.create();
```