#!/usr/bin/env python3
"""Idempotently set the store's offers (price + published status) in the backend.

  bin/with-secrets opticworks-backend -- python3 -I infrastructure/ansible/scripts/catalog_offers.py [--apply]

The seed creates one DRAFT, unpriced product per program (handle == program
slug). This script is the source of truth for what is offered and at what
price: it prices each product's single "Standard" variant and publishes it.
Products not listed here are left alone. Dry run by default; prints IDs and
amounts only.

Medusa v2 stores amounts in major units (5999 == $5,999.00).

Env: CLOUDFLARE_BACKEND_ACCESS_ID/_TOKEN (Access service token),
MEDUSA_ADMIN_EMAIL/_PASSWORD.
"""
import json
import os
import sys
import urllib.error
import urllib.request

BASE = "https://backend.optic.works"
CURRENCY = "usd"

# Owner-approved list prices (2026-10-30). Subject to change: edit and re-run.
OFFERS = {
    "vmc": 5999,
    "mach-1": 5999,
}


def call(method, path, body=None, token=None):
    headers = {
        "CF-Access-Client-Id": os.environ["CLOUDFLARE_BACKEND_ACCESS_ID"],
        "CF-Access-Client-Secret": os.environ["CLOUDFLARE_BACKEND_ACCESS_TOKEN"],
        "Content-Type": "application/json",
        # Cloudflare rejects urllib's default User-Agent.
        "User-Agent": "opticworks-catalog/1.0",
    }
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(
        BASE + path,
        method=method,
        headers=headers,
        data=json.dumps(body).encode() if body is not None else None,
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"{method} {path}: HTTP {e.code} {e.read()[:200].decode(errors='replace')}")


def main():
    apply = "--apply" in sys.argv[1:]
    token = call(
        "POST",
        "/auth/user/emailpass",
        {"email": os.environ["MEDUSA_ADMIN_EMAIL"], "password": os.environ["MEDUSA_ADMIN_PASSWORD"]},
    )["token"]

    for handle, amount in OFFERS.items():
        found = call("GET", f"/admin/products?handle={handle}&fields=id,status,*variants,*variants.prices", token=token)
        if len(found["products"]) != 1:
            sys.exit(f"{handle}: expected one product, found {len(found['products'])}")
        product = found["products"][0]
        if len(product["variants"]) != 1:
            sys.exit(f"{handle}: expected one variant, found {len(product['variants'])}")
        variant = product["variants"][0]
        current = {p["currency_code"]: p["amount"] for p in variant.get("prices") or []}

        price_ok = current == {CURRENCY: amount}
        status_ok = product["status"] == "published"
        print(f"{handle}: {product['id']} status={product['status']} prices={current} -> {CURRENCY} {amount}, published")
        if price_ok and status_ok:
            print("  up to date")
            continue
        if not apply:
            print("  would update (dry run; pass --apply)")
            continue
        if not price_ok:
            # Reuse the existing USD price's id so a price change updates it in
            # place; any other currencies are dropped.
            price = {"currency_code": CURRENCY, "amount": amount}
            existing = next((p for p in variant.get("prices") or [] if p["currency_code"] == CURRENCY), None)
            if existing:
                price["id"] = existing["id"]
            call(
                "POST",
                f"/admin/products/{product['id']}/variants/{variant['id']}",
                {"prices": [price]},
                token=token,
            )
        if not status_ok:
            call("POST", f"/admin/products/{product['id']}", {"status": "published"}, token=token)
        print("  updated")


if __name__ == "__main__":
    main()
