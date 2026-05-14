import { requireAdminPagePermission } from '@/lib/admin-auth'


import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, RefreshCw } from 'lucide-react'

const settings = {
  general: [
    { label: '서비스 이름', value: 'AI Linker', type: 'text' },
    { label: '운영 이메일', value: 'admin@ailinker.io', type: 'email' },
    { label: '지원 이메일', value: 'support@ailinker.io', type: 'email' },
    { label: '서비스 URL', value: 'https://ailinker.io', type: 'url' },
  ],
  token: [
    { label: '초기 가입 크레딧 (토큰)', value: '10000', type: 'number' },
    { label: '토큰 부족 알림 기준', value: '5000', type: 'number' },
    { label: '자동 충전 최소 잔액', value: '1000', type: 'number' },
  ],
  llm: [
    { label: '기본 LLM Provider', value: 'OpenAI', type: 'select', options: ['OpenAI', 'Anthropic', 'OpenRouter'] },
    { label: '기본 모델', value: 'gpt-4o-mini', type: 'text' },
    { label: '최대 토큰/요청', value: '4096', type: 'number' },
    { label: '응답 타임아웃 (ms)', value: '30000', type: 'number' },
  ],
}

export default async function SettingsPage() {
  await requireAdminPagePermission('SETTINGS_MANAGE')
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">시스템 설정</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI Linker 플랫폼 전역 설정</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Save className="w-3.5 h-3.5" />
          저장
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" className="text-xs">일반</TabsTrigger>
          <TabsTrigger value="token" className="text-xs">토큰 정책</TabsTrigger>
          <TabsTrigger value="llm" className="text-xs">LLM 설정</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">알림</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">보안</TabsTrigger>
        </TabsList>

        {(['general', 'token', 'llm'] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="bg-card rounded-lg border border-border p-5 space-y-5 max-w-xl">
              {settings[tab].map((setting) => (
                <div key={setting.label}>
                  <label className="text-xs font-medium text-foreground block mb-1.5">{setting.label}</label>
                  {'options' in setting ? (
                    <select
                      className="w-full h-9 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      defaultValue={setting.value}
                    >
                      {setting.options?.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <Input className="h-9 text-sm" type={setting.type} defaultValue={setting.value} />
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="notifications" className="mt-4">
          <div className="bg-card rounded-lg border border-border p-5 max-w-xl space-y-4">
            {[
              { label: '신규 결제 알림', checked: true },
              { label: '환불 요청 알림', checked: true },
              { label: 'LLM 잔액 부족 알림', checked: true },
              { label: '신규 상담 알림', checked: true },
              { label: '일일 매출 리포트', checked: false },
              { label: '커뮤니티 신고 알림', checked: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-foreground">{item.label}</span>
                <button
                  className={`w-10 h-5.5 rounded-full transition-colors relative ${item.checked ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <div className="bg-card rounded-lg border border-border p-5 max-w-xl space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5">세션 만료 시간 (분)</label>
              <Input className="h-9 text-sm" defaultValue="60" type="number" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">API Rate Limit (요청/분)</label>
              <Input className="h-9 text-sm" defaultValue="100" type="number" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5">허용 IP (빈 칸 = 전체 허용)</label>
              <textarea className="w-full h-20 bg-background border border-border rounded-md p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" placeholder="1.2.3.4&#10;5.6.7.8" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              비밀번호 재설정 메일 발송
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
