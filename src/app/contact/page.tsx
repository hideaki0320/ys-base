"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "送信に失敗しました。時間をおいて再度お試しください");
        return;
      }
      setSubmitted(true);
      window.scrollTo({ top: 0 });
    } catch {
      setError("通信に失敗しました。電波の良い場所で再度お試しください");
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <>
        <PageHero title="お問い合わせ" subtitle="CONTACT" />
        <section className="py-16 sm:py-24">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-green-50 border border-green-100 p-8 sm:p-12 rounded-sm">
              <h2 className="text-2xl font-black text-primary mb-4">
                お問い合わせを受け付けました
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                お問い合わせいただきありがとうございます。
                <br />
                内容を確認の上、担当者よりご連絡いたします。
                <br />
                通常2〜3営業日以内にご返信いたします。
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero title="お問い合わせ" subtitle="CONTACT" />

      <section className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center mb-10 leading-relaxed">
            YS-BASEへのお問い合わせは、下記フォームよりお送りください。
            <br />
            通常2〜3営業日以内にご返信いたします。
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* スパム対策の入力欄（人には表示しない） */}
            <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
              <label htmlFor="website">Website</label>
              <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-[13px] font-bold text-primary mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label htmlFor="org" className="block text-[13px] font-bold text-primary mb-2">
                  チーム名・団体名
                </label>
                <input
                  type="text"
                  id="org"
                  name="org"
                  className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="email" className="block text-[13px] font-bold text-primary mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-[13px] font-bold text-primary mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-[13px] font-bold text-primary mb-2">
                お問い合わせ種別 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-all bg-gray-50 focus:bg-white"
              >
                <option value="">選択してください</option>
                <option value="reservation">予約について</option>
                <option value="facility">施設について</option>
                <option value="event">イベント利用について</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-[13px] font-bold text-primary mb-2">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-all resize-vertical bg-gray-50 focus:bg-white"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-sm">
                {error}
              </p>
            )}

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-primary-dark font-bold px-10 py-3.5 text-sm transition-all rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? "送信中..." : "送信する"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
