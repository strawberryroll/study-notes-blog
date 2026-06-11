"use client"

import { Moon, Palette, ShieldCheck, Sparkles } from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ContactForm } from "@/components/common/contact-form"
import { Container } from "@/components/layout/container"

const features = [
  {
    icon: Moon,
    title: "다크 모드",
    description: "next-themes 기반 light/dark/system 테마 전환을 지원합니다.",
    badge: "next-themes",
  },
  {
    icon: ShieldCheck,
    title: "타입 세이프 폼 검증",
    description: "react-hook-form과 zod로 폼 입력값을 안전하게 검증합니다.",
    badge: "react-hook-form + zod",
  },
  {
    icon: Sparkles,
    title: "토스트 알림",
    description: "sonner로 가볍고 접근성 높은 알림을 표시합니다.",
    badge: "sonner",
  },
  {
    icon: Palette,
    title: "shadcn/ui 컴포넌트",
    description: "Radix 기반의 재사용 가능한 UI 컴포넌트 세트를 제공합니다.",
    badge: "shadcn/ui",
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 sm:py-32">
        <Container className="flex flex-col items-center gap-6 text-center">
          <Badge variant="secondary">Next.js 16 · TypeScript · Tailwind CSS</Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            빠르게 시작하는 모던 웹 스타터킷
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            shadcn/ui, lucide-react, 다크 모드, 폼 검증, 토스트 알림까지
            바로 사용할 수 있는 구성요소가 준비되어 있습니다.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#components">컴포넌트 둘러보기</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">특징 보기</a>
            </Button>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">특징</h2>
            <p className="mt-2 text-muted-foreground">
              스타터킷에 기본으로 포함된 기능들입니다.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="size-8 text-primary" />
                  <CardTitle className="mt-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{feature.badge}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Component demo */}
      <section id="components" className="py-16 sm:py-24">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">컴포넌트 데모</h2>
            <p className="mt-2 text-muted-foreground">
              자주 사용하는 폼과 피드백 컴포넌트를 직접 확인해보세요.
            </p>
          </div>
          <Tabs defaultValue="form" className="mx-auto max-w-xl">
            <TabsList className="w-full">
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            <TabsContent value="form">
              <Card>
                <CardHeader>
                  <CardTitle>문의하기</CardTitle>
                  <CardDescription>
                    react-hook-form과 zod로 검증되는 데모 폼입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="feedback" className="space-y-4">
              <Alert>
                <AlertTitle>알림</AlertTitle>
                <AlertDescription>
                  Alert 컴포넌트는 페이지 내 중요한 정보를 강조할 때 사용합니다.
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap items-center gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">다이얼로그 열기</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>다이얼로그 제목</DialogTitle>
                      <DialogDescription>
                        Dialog 컴포넌트는 사용자 확인이 필요한 작업에 사용합니다.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button>확인</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">툴팁 보기</Button>
                  </TooltipTrigger>
                  <TooltipContent>도움말 텍스트가 표시됩니다.</TooltipContent>
                </Tooltip>

                <Button
                  variant="outline"
                  onClick={() =>
                    toast("토스트 알림", {
                      description: "sonner로 표시되는 알림입니다.",
                    })
                  }
                >
                  토스트 표시
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-24">
        <Container className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">자주 묻는 질문</h2>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>새 컴포넌트는 어떻게 추가하나요?</AccordionTrigger>
              <AccordionContent>
                <code>pnpm dlx shadcn@latest add [컴포넌트명]</code> 명령으로
                필요한 shadcn/ui 컴포넌트를 추가할 수 있습니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>다크 모드는 어떻게 동작하나요?</AccordionTrigger>
              <AccordionContent>
                next-themes가 시스템 설정을 감지하고, 헤더의 테마 토글
                버튼으로 light/dark/system 모드를 전환할 수 있습니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>레이아웃 컴포넌트는 어디에 있나요?</AccordionTrigger>
              <AccordionContent>
                <code>src/components/layout</code>에 Header, Footer,
                Container 등이 있고, <code>src/components/common</code>에
                ThemeToggle, Logo 같은 재사용 컴포넌트가 있습니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Container>
      </section>
    </div>
  )
}
