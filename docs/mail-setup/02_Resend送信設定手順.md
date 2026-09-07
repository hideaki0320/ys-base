# Resend 送信設定手順（ys-base@yscc1986.net から送るために）

作成日: 2026-09-07
対象: YS-BASE（Railway サービス `ys-base`、本番 https://ys-base.yscc1986.net ）

---

## 0. 先に結論

**DNS の追加作業は不要です。** 2026-09-07 時点で yscc1986.net には Resend 用のレコードがすべて存在し、
yscc-ticket が同じドメイン（info@yscc1986.net）から Resend で送信できています。

やることは次の 4 つだけです。

1. Resend ダッシュボードで yscc1986.net が Verified になっていることを確認する
2. ys-base 用の API キーを作る
3. Railway（ys-base / production）に環境変数を入れる
4. テストメールを 1 通送って、SPF / DKIM / DMARC が pass することを確認する

---

## 1. DNS の現状（確認済みの事実）

```
resend._domainkey.yscc1986.net  TXT  p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCeotac...  ← DKIM
send.yscc1986.net               MX   10 feedback-smtp.ap-northeast-1.amazonses.com     ← Return-Path（東京リージョン）
send.yscc1986.net               TXT  v=spf1 include:amazonses.com ~all                  ← Return-Path 用 SPF
_dmarc.yscc1986.net             TXT  v=DMARC1; p=none; sp=quarantine; rua=mailto:no1dmarcreport@no1-server28.com; ...
yscc1986.net                    TXT  v=spf1 include:spf.no1-server28.com include:_spf.google.com -all
```

ポイント:

- Resend はルートドメインの SPF/MX を触らず、`send.` サブドメインと DKIM だけを使う構成。Google Workspace の受信とは干渉しない
- DMARC は DKIM（`resend._domainkey`）で From ドメインと一致（アライメント）するので pass する
- DMARC の `sp=quarantine`（サブドメインは隔離）があるため、**差出人は必ず `@yscc1986.net` 直下** にする。`@send.yscc1986.net` や `@ys-base.yscc1986.net` を From にしない

---

## 2. Resend ダッシュボードでの確認（5 分）

1. https://resend.com にログイン。**yscc-ticket で使っているチーム** を開く
   - 別チームに yscc1986.net を追加しようとすると DKIM 鍵が別物になり、DNS 変更（制作会社作業）が必要になる。同じチームを使う
2. 左メニュー **Domains** → `yscc1986.net` を開く
3. 確認する項目
   - Status: **Verified**
   - Region: **Tokyo (ap-northeast-1)**
   - DKIM / SPF（send）/ MX（send）がすべて緑
4. もし Verified になっていない場合
   - 画面に表示されるレコード値と、上記「1. DNS の現状」の値を突き合わせる
   - 値が違うレコードだけを **制作会社に変更依頼**（値はダッシュボードからコピーして渡す）
   - 「Verify」を押して再チェック

---

## 3. API キーの発行（3 分）

1. 左メニュー **API Keys** → **Create API Key**
2. 設定
   - Name: `ys-base-production`
   - Permission: **Sending access**（Full access にしない）
   - Domain: `yscc1986.net` に限定
3. 表示されたキー（`re_` で始まる）をコピー。**この画面を閉じると二度と表示されない**
4. キーはチャットや Git に貼らない。次の手順で Railway に直接入れる

---

## 4. Railway 環境変数（ys-base / production）

Railway ダッシュボード → プロジェクト `ys-base` → サービス `ys-base` → **Variables** → 以下を追加。
（変数名はアプリ実装時にこの名前で参照します）

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=YS-BASE <ys-base@yscc1986.net>
MAIL_REPLY_TO=ys-base@yscc1986.net
```

- `MAIL_FROM` の表示名は自由（例: `YS-BASE 予約センター`）。アドレス部分は `ys-base@yscc1986.net` 固定
- 追加後に Redeploy が走る。稼働確認は https://ys-base.yscc1986.net/facility が 200 で返ることで確認
- preview 環境を作る場合は同じ 3 変数を入れる（テスト送信先を自分のアドレスに限定する運用にする）

---

## 5. テスト送信（実データで確認・必須）

ターミナルから 1 通だけ自分宛に送る（`re_...` と宛先を置き換える）。

```bash
curl -s https://api.resend.com/emails \
  -H "Authorization: Bearer re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "YS-BASE <ys-base@yscc1986.net>",
    "to": ["hideaki.nakamori@gmail.com"],
    "reply_to": "ys-base@yscc1986.net",
    "subject": "[テスト] YS-BASE 送信確認",
    "text": "YS-BASE の Resend 送信テストです。"
  }'
```

期待するレスポンス: `{"id":"..."}`（エラー時は `"message"` に理由が入る）

Gmail で受信したら **「︙」→「メッセージのソースを表示」** を開き、次の 3 つが `PASS` であることを確認する。

```
SPF:   PASS
DKIM:  PASS  （署名ドメイン yscc1986.net）
DMARC: PASS
```

1 つでも FAIL なら送信を止めて、ダッシュボードの Domains 画面と DNS を再確認する。

---

## 6. 返信が届くかの確認（メールボックス発行後）

制作会社の作業（`01_制作会社向け_メールアドレス発行指示書.md`）が完了したら、
手順 5 のテストメールに **返信** して、`ys-base@yscc1986.net` の受信担当者に届くことを確認する。
これが通るまで、サイトにメールアドレスを掲載しない（返信が宛先不明で跳ねるため）。

---

## 7. 任意（あとで）: バウンス・苦情の Webhook

配信不能（bounced）や迷惑メール報告（complained）を検知して、そのアドレスへの再送を止めるための設定。
予約確認メールの実装時に合わせて行う。

1. Resend → **Webhooks** → Add Endpoint
   - URL: `https://ys-base.yscc1986.net/api/resend/webhook`（実装時に作成）
   - Events: `email.bounced`, `email.complained`, `email.delivered`
2. Signing Secret を Railway に追加

```
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

---

## 8. この後アプリ側でやること（別タスク）

現在のサイトは「確認メールをお送りしました」「利用確定メールをお送りします」と表示していますが、
**メール送信コードはまだ実装されていません**（2026-09-07 時点）。
上記 1〜6 が完了したら、次を実装します。

- 決済完了 Webhook（Stripe）→ 予約確認メールを Resend で送信
- 管理画面からの再送（送信前プレビュー → 確認の 2 段階、宛先選択、文面編集）
- bounced / complained アドレスの自動除外

外部依存（実装前チェックリスト）

- [ ] ys-base@yscc1986.net が受信できる（制作会社作業）
- [ ] Resend で yscc1986.net が Verified
- [ ] Railway に RESEND_API_KEY / MAIL_FROM / MAIL_REPLY_TO
- [ ] テスト 1 通で SPF / DKIM / DMARC = PASS
