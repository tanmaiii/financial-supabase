"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { ModeToggle } from "@/components/common/ModeToggle";
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { PATHS, withLocale } from "@/constants/path";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 group transition-all"
            >
              <div className="w-10 h-10 bg-linear-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-all group-hover:scale-105">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {t("landing.title")}
                </span>
                <span className="text-xs text-muted-foreground -mt-1">
                  {t("landing.subtitle")}
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ModeToggle />
              <Link
                href={withLocale("en", PATHS.LOGIN)}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2"
              >
                {t("auth.login")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-block">
              <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6 animate-pulse-subtle">
                ✨ {t("landing.subtitle")}
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-linear-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient">
                {t("landing.heroTitle")}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("landing.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={withLocale("en", PATHS.REGISTER)}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 flex items-center gap-2 group"
              >
                {t("landing.getStarted")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-semibold transition-all hover:scale-105"
              >
                {t("landing.learnMore")}
              </Link>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-accent/20 blur-3xl opacity-50" />
            <div className="relative bg-linear-to-br from-card to-card/50 rounded-2xl border border-border shadow-2xl p-8 backdrop-blur-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    icon: Wallet,
                    label: t("landing.features.tracking.title"),
                    value: "$12,345",
                    color: "from-blue-500 to-blue-600",
                  },
                  {
                    icon: TrendingUp,
                    label: t("landing.features.analytics.title"),
                    value: "+23%",
                    color: "from-green-500 to-green-600",
                  },
                  {
                    icon: PiggyBank,
                    label: t("landing.features.goals.title"),
                    value: "$5,000",
                    color: "from-purple-500 to-purple-600",
                  },
                  {
                    icon: BarChart3,
                    label: t("landing.features.budget.title"),
                    value: "85%",
                    color: "from-orange-500 to-orange-600",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-primary/50 transition-all hover:scale-105 group"
                  >
                    <div
                      className={`w-10 h-10 bg-linear-to-br ${item.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold mb-1">{item.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              {t("landing.features.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Wallet,
                title: t("landing.features.tracking.title"),
                description: t("landing.features.tracking.description"),
                gradient: "from-blue-500/10 to-blue-600/10",
                iconBg: "from-blue-500 to-blue-600",
              },
              {
                icon: BarChart3,
                title: t("landing.features.budget.title"),
                description: t("landing.features.budget.description"),
                gradient: "from-orange-500/10 to-orange-600/10",
                iconBg: "from-orange-500 to-orange-600",
              },
              {
                icon: TrendingUp,
                title: t("landing.features.analytics.title"),
                description: t("landing.features.analytics.description"),
                gradient: "from-green-500/10 to-green-600/10",
                iconBg: "from-green-500 to-green-600",
              },
              {
                icon: PiggyBank,
                title: t("landing.features.goals.title"),
                description: t("landing.features.goals.description"),
                gradient: "from-purple-500/10 to-purple-600/10",
                iconBg: "from-purple-500 to-purple-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-linear-to-br ${feature.gradient} p-8 rounded-2xl border border-border hover:border-primary/50 transition-all hover:scale-105 hover:shadow-xl`}
              >
                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 bg-linear-to-br ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden bg-linear-to-br from-primary to-primary/70 rounded-3xl p-12 text-center text-primary-foreground shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,transparent,black)]" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {t("landing.heroTitle")}
              </h2>
              <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                {t("landing.heroSubtitle")}
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:scale-105 transition-all shadow-xl hover:shadow-2xl group"
              >
                {t("landing.getStarted")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-muted-foreground">
            <p>© 2026 {t("landing.title")}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
