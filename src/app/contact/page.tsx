"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <>
        <PageHero title="お問い合わせ" subtitle="CONTACT" />
        <section className="py-16 sm:py-24">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-green-50 border border-green-200 p-8 sm:p-12">
              <h2 className="text-2xl font-black text-primary mb-4">
                お問い合わせを受け付けました
              </h2>
              <p className="text-gray-700 leading-relaxed">
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
          <p className="text-gray-700 text-center mb-10 leading-relaxed">
            YS-BASEへのお問い合わせは、下記フォームよりお送りください。
            <br />
            通常2〜3営業日以内にご返信いたします。
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-primary mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="org" className="block text-sm font-bold text-primary mb-2">
                  チーム名・団体名
                </label>
                <input
                  type="text"
                  id="org"
                  name="org"
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-primary mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-primary mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-bold text-primary mb-2">
                お問い合わせ種別 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors bg-white"
              >
                <option value="">選択してください</option>
                <option value="reservation">予約について</option>
                <option value="facility">施設について</option>
                <option value="event">イベント利用について</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-bold text-primary mb-2">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors resize-vertical"
              />
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-primary font-bold px-10 py-4 text-base transition-colors"
              >
                <Send size={18} />
                送信する
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
