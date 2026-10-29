"""Shared checkout discount calculations."""

MAX_COMBINED_DISCOUNT = 0.40
ORDER_VALUE_THRESHOLD = 500
ORDER_VALUE_DISCOUNT = 0.10
PRODUCT_DISCOUNTS = {
    'AirPods 3': 0.10,
}


def calculate_checkout_discounts(cart, promo_code, promo_codes):
    """Calculate the subtotal, savings, total, rate, and discount label."""
    subtotal = round(sum(
        details['price'] * details['quantity']
        for details in cart.values()
    ), 2)

    promo_rate = promo_codes.get(promo_code, 0)
    order_rate = (
        ORDER_VALUE_DISCOUNT
        if subtotal >= ORDER_VALUE_THRESHOLD
        else 0
    )

    active_discounts = []
    if promo_rate:
        active_discounts.append(
            f"Promo ({promo_code} -{int(promo_rate * 100)}%)")
    if order_rate:
        active_discounts.append("Order Over $500 -10%")

    product_rate = 0
    for item, rate in PRODUCT_DISCOUNTS.items():
        if item in cart:
            product_rate += rate
            active_discounts.append(f"{item} offer -{int(rate * 100)}%")

    combined_rate = promo_rate + order_rate + product_rate
    discount = min(combined_rate, MAX_COMBINED_DISCOUNT)
    savings = round(subtotal * discount, 2)
    if combined_rate > MAX_COMBINED_DISCOUNT:
        active_discounts.append("combined discount capped at 40%")

    total = round(subtotal - savings, 2)
    effective_discount = savings / subtotal if subtotal else 0
    discount_label = " + ".join(active_discounts) or None

    return {
        'subtotal': subtotal,
        'savings': savings,
        'total': total,
        'discount': effective_discount,
        'discount_label': discount_label,
    }
