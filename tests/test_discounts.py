import unittest

from discounts import calculate_checkout_discounts


class CheckoutDiscountTests(unittest.TestCase):
    def test_stacks_promo_order_and_product_discounts(self):
        cart = {
            'AirPods 3': {'price': 199, 'quantity': 1},
            'Headphones': {'price': 301, 'quantity': 1},
        }

        result = calculate_checkout_discounts(cart, 'AUDIO26', {'AUDIO26': 0.20})

        self.assertEqual(result['subtotal'], 500)
        self.assertEqual(result['savings'], 200)
        self.assertEqual(result['total'], 300)
        self.assertAlmostEqual(result['discount'], 0.40)
        self.assertIn('Promo (AUDIO26 -20%)', result['discount_label'])
        self.assertIn('Order Over $500 -10%', result['discount_label'])
        self.assertIn('AirPods 3 offer -10%', result['discount_label'])

    def test_order_discount_applies_at_threshold(self):
        cart = {'Headphones': {'price': 500, 'quantity': 1}}

        result = calculate_checkout_discounts(cart, '', {})

        self.assertEqual(result['savings'], 50)
        self.assertEqual(result['total'], 450)

    def test_product_offer_requires_product_in_cart(self):
        cart = {
            'AirPods 3': {'price': 199, 'quantity': 1},
            'Audio Cable': {'price': 100, 'quantity': 1},
        }

        result = calculate_checkout_discounts(cart, '', {})

        self.assertEqual(result['subtotal'], 299)
        self.assertEqual(result['savings'], 29.90)
        self.assertEqual(result['total'], 269.10)

        without_airpods = calculate_checkout_discounts(
            {'Audio Cable': {'price': 299, 'quantity': 1}}, '', {}
        )
        self.assertEqual(without_airpods['savings'], 0)
        self.assertEqual(without_airpods['total'], 299)

    def test_total_discount_is_capped_at_40_percent(self):
        cart = {
            'AirPods 3': {'price': 199, 'quantity': 1},
            'Headphones': {'price': 401, 'quantity': 1},
        }

        result = calculate_checkout_discounts(cart, 'MAX', {'MAX': 0.50})

        self.assertEqual(result['subtotal'], 600)
        self.assertEqual(result['savings'], 240)
        self.assertEqual(result['total'], 360)
        self.assertAlmostEqual(result['discount'], 0.40)
        self.assertIn('capped at 40%', result['discount_label'])

    def test_zero_subtotal_has_no_discount(self):
        result = calculate_checkout_discounts({}, '', {})

        self.assertEqual(result['subtotal'], 0)
        self.assertEqual(result['savings'], 0)
        self.assertEqual(result['total'], 0)
        self.assertEqual(result['discount'], 0)
        self.assertIsNone(result['discount_label'])


if __name__ == '__main__':
    unittest.main()
