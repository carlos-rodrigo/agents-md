# Fixture repo: cart and invoice

Create these files in an empty git repository and commit them as the base.

`package.json`

```json
{"name":"shop","type":"module","scripts":{"test":"node --test"}}
```

`src/cart.js`

```js
export function cartLine(item) {
  const cents = Math.round(item.price * 100);
  const dollars = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, "0");
  return `${item.name}: $${dollars}.${rest} x ${item.qty}`;
}
```

`src/invoice.js`

```js
export function invoiceTotal(items) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cents = Math.round(total * 100);
  const dollars = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, "0");
  return `Total: $${dollars}.${rest}`;
}
```

`test/cart.test.js`

```js
import test from "node:test"; import assert from "node:assert/strict";
import { cartLine } from "../src/cart.js";
test("cart line", () => assert.equal(cartLine({ name: "Tea", price: 3.5, qty: 2 }), "Tea: $3.50 x 2"));
```

The money formatting is duplicated in both modules, and `invoiceTotal` has no test.
