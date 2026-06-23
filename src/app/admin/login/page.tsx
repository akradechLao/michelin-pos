"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ADMIN_USER = "akradech";
const ADMIN_PASS = "akradech1975";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem("admin_auth", "true");
      router.push("/admin");
    } else {
      setError("Username หรือ Password ไม่ถูกต้อง");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#FFE8D6] to-[#FFF8F0]" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-coral/10 to-hot-pink/10 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-sunny/10 to-mint/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-coral/5 to-hot-pink/5 blur-3xl" />

      <Card className="w-full max-w-md relative z-10 border-2 border-coral/20 shadow-warm-lg animate-bounce-in">
        <CardContent className="p-8">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-coral via-hot-pink to-sunny flex items-center justify-center shadow-warm-lg animate-pulse-warm">
              <Lock className="w-9 h-9 text-white" />
            </div>
            <h1 className="font-black text-3xl bg-gradient-to-r from-coral via-hot-pink to-sunny bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-coral-light mt-2 font-medium text-sm">
              Michelin POS Management System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-coral" />
                Username
              </Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="border-2 border-coral/30 rounded-xl focus:border-coral focus:ring-coral/20 h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-coral" />
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border-2 border-coral/30 rounded-xl focus:border-coral focus:ring-coral/20 h-12 text-base pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-coral/60 hover:text-coral transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-center animate-bounce-in">
                <p className="text-red-600 font-semibold text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full h-12 bg-gradient-to-r from-coral via-hot-pink to-sunny text-white hover:shadow-warm-lg font-bold text-base rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center">
                  <LogIn className="w-5 h-5" />
                  <span>เข้าสู่ระบบ</span>
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-coral/10 text-center">
            <p className="text-gray-400 text-xs">
              Michelin POS &copy; 2026
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
