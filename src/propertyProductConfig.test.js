import test from 'node:test';
import assert from 'node:assert';
import { getPropertyVariant, PROPERTY_PRODUCT_VARIANTS } from './propertyProductConfig.js';

test('getPropertyVariant', async (t) => {
  await t.test('returns requested valid variant', () => {
    const variant = getPropertyVariant('property-all-risk');
    assert.deepStrictEqual(variant, PROPERTY_PRODUCT_VARIANTS['property-all-risk']);
    assert.strictEqual(variant.key, 'property-all-risk');
  });

  await t.test('returns default property-safe variant when no argument is provided', () => {
    const variant = getPropertyVariant();
    assert.deepStrictEqual(variant, PROPERTY_PRODUCT_VARIANTS['property-safe']);
    assert.strictEqual(variant.key, 'property-safe');
  });

  await t.test('returns default property-safe variant when invalid variantKey is provided', () => {
    const variant = getPropertyVariant('non-existent-variant');
    assert.deepStrictEqual(variant, PROPERTY_PRODUCT_VARIANTS['property-safe']);
    assert.strictEqual(variant.key, 'property-safe');
  });
});
