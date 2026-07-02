import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Please enter your registered email or phone number.");
      return;
    }
    setLoading(true);
    setStatusMessage("");
    setGeneratedPassword("");
    try {
      const res = await axiosInstance.post("/user/forgot-password", {
        identifier: identifier.trim(),
      });
      setGeneratedPassword(res.data.password);
      setStatusMessage(
        "Your password has been reset successfully. Use the generated password below to log in.",
      );
      toast.success("Password reset successful.");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Something went wrong.";
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 lg:mb-8">
          <Link href="/" className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
              <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-orange-500 rounded-sm"></div>
              </div>
            </div>
            <span className="text-lg lg:text-xl font-bold text-gray-800">
              stack<span className="font-normal">overflow</span>
            </span>
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-xl lg:text-2xl">
                Forgot Password
              </CardTitle>
              <CardDescription>
                Reset your password with your registered email or phone number.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm">
                  Email or Phone
                </Label>
                <Input
                  id="identifier"
                  placeholder="you@example.com or +1234567890"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Request this option once per day. The new password will
                  contain only letters.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                disabled={loading}
              >
                {loading ? "Sending..." : "Reset Password"}
              </Button>
              {statusMessage ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  {statusMessage}
                </div>
              ) : null}
              {generatedPassword ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                  <p className="font-semibold">Generated password:</p>
                  <p className="mt-2 break-all text-lg font-medium">
                    {generatedPassword}
                  </p>
                </div>
              ) : null}
              <div className="text-center text-sm">
                Remembered your password?{" "}
                <Link href="/auth" className="text-blue-600 hover:underline">
                  Log in
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
