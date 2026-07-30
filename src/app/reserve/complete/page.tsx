import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "予約完了",
};

export default function ReservationCompletePage() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 sm:p-12 border border-gray-200">
          <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CircleCheck size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-primary mb-4">
            お支払いが完了しました
          </h1>
          <p className="text-gray-700 leading-relaxed mb-8">
            ご予約・お支払いいただきありがとうございます。
            <br />
            利用確定のご案内メールをお送りいたしました。
            <br />
            当日のご来場をお待ちしております。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 transition-colors"
            >
              トップに戻る
            </Link>
            <Link
              href="/reserve/calendar"
              className="border border-primary text-primary hover:bg-primary/5 font-bold px-8 py-3 transition-colors"
            >
              別の日を予約する
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
