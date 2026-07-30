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
        <div className="bg-white p-8 sm:p-12 border border-gray-100 rounded-sm">
          <div className="w-14 h-14 bg-green-50 flex items-center justify-center mx-auto mb-6 rounded-full">
            <CircleCheck size={28} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-primary mb-4">
            お支払いが完了しました
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            ご予約・お支払いいただきありがとうございます。
            <br />
            利用確定のご案内メールをお送りいたしました。
            <br />
            当日のご来場をお待ちしております。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-primary hover:bg-primary-light text-white font-bold px-8 py-3 text-sm transition-colors rounded-sm"
            >
              トップに戻る
            </Link>
            <Link
              href="/reserve/calendar"
              className="border border-gray-200 text-primary hover:bg-gray-50 font-bold px-8 py-3 text-sm transition-colors rounded-sm"
            >
              別の日を予約する
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
