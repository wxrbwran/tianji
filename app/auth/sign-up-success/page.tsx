import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, Gift } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              天机AI
            </h1>
          </div>
          <p className="text-muted-foreground">传统智慧，现代科技</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-400">
              注册成功！
            </CardTitle>
            <CardDescription>
              欢迎加入天机AI，开启您的命理探索之旅
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Mail className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">邮箱验证</h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                我们已向您的邮箱发送了验证邮件，请点击邮件中的链接来激活您的账户。
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Gift className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">新用户福利</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🎉 恭喜您获得 <span className="font-bold text-blue-800 dark:text-blue-200">300 天机点</span> 新用户奖励！
                <br />
                足够进行一次完整的八字命盘分析体验。
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/auth/login" className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  立即登录体验
                </Button>
              </Link>

              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  返回首页
                </Button>
              </Link>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>没有收到邮件？请检查垃圾邮件文件夹</p>
              <p>或联系客服获得帮助</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
