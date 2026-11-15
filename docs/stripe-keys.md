# Stripe キーの運用（ys-base）

2026-11-15 に、別アプリのためのキー作り直しで ys-base の Stripe キーが期限切れになり、雨天中止の返金が止まった。
同じことが起きないよう、次の形で運用する。

## 構成

| Railway の変数（ys-base / production） | 中身 | 役割 |
|---|---|---|
| `STRIPE_SECRET_KEY` | ys-base 専用の制限付きキー（`rk_live_`）その1 | 主キー |
| `STRIPE_SECRET_KEY_BACKUP` | ys-base 専用の制限付きキー（`rk_live_`）その2 | 予備キー。主キーが拒否されたら自動でこちらに切り替わる（`src/lib/stripe.ts`） |
| `HEALTH_CHECK_TOKEN` | ランダムな文字列 | 毎朝の監視が `/api/health/integrations` を呼ぶための合言葉 |

- チケットサイト（yscc-ticket）とは **同じ Stripe アカウントだが、キーは分ける**。片方のキーを作り直しても、もう片方は止まらない
- 予備キーに切り替わったとき・両方使えないときは、運営（`CONTACT_NOTIFY_TO`）にメールが届く
- 毎朝、監視リポジトリがキー2本・Resend キー・「支払い済みなのに予約がない決済」を確かめ、異常があれば GitHub の Issue で知らせる

## 制限付きキーの権限

Stripe ダッシュボード → 開発者 → API キー → 「制限付きキーを作成」。次のとおり設定し、他はすべて「なし」。

| リソース | 権限 | 使っている処理 |
|---|---|---|
| Checkout Sessions | 書き込み | 支払い画面の作成（`/api/checkout`）、割引コードの確認（webhook）、取りこぼしの確認（監視） |
| PaymentIntents | 読み取り | 返金前の返金済み額の確認（`/api/admin/cancel`） |
| Charges | 読み取り | 同上（`latest_charge` の展開） |
| Refunds | 書き込み | 返金（`/api/admin/cancel`、`/api/admin/rain-cancel`） |
| Promotion Codes | 読み取り | 割引コード名の取得（webhook） |
| Coupons | 読み取り | 同上 |
| Balance | 読み取り | 毎朝のキー有効確認 |

- キー名: `ys-base 主` / `ys-base 予備`
- メモ欄: `Railway ys-base production STRIPE_SECRET_KEY`（予備は `..._BACKUP`）
- 権限が足りないと Stripe は 403 を返す。403 は予備に切り替えない（設定ミスを隠さないため）。キーのリクエストログで失敗した操作を確かめて権限を足す

## キーを入れ替えるとき（止めずに入れ替える手順）

キーが漏れた・漏れた疑いがあるときだけ行う。定期的に練習するなら同じ手順で。

1. 新しい制限付きキーを上の権限で作る
2. Railway の `STRIPE_SECRET_KEY_BACKUP` を新しいキーにして反映する
3. `/api/health/integrations` で「Stripe 予備キー：有効」を確かめる
4. Stripe で古い主キーを削除（または期限切れに）し、Railway の `STRIPE_SECRET_KEY` も新しいキーに替える
5. もう1本も同じ手順で作り直す（主と予備を同じキーのままにしない）

**ほかのアプリのキーを作り直すときは、そのアプリの変数だけを替える。** キー名とメモ欄で、どのアプリのキーかを確かめてから操作する。

## 確認

```bash
curl -s -H "Authorization: Bearer <HEALTH_CHECK_TOKEN>" https://ys-base.yscc1986.net/api/health/integrations
```

`"ok": true` なら正常。`checks` の各項目に結果が出る（キーの値は出ない）。
