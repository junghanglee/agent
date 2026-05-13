import { PrismaClient, Platform, ProductStatus, ReleaseStatus, PurchaseStatus, PaymentStatus, InstallCodeStatus, LicenseStatus, CreditTransactionType, ProviderStatus, SkillBillingType, TicketStatus, SenderType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@ailinker.local' },
    update: {},
    create: {
      email: 'admin@ailinker.local',
      name: 'AI Linker Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: '김민준',
      phone: '010-0000-0000',
      status: 'ACTIVE',
    },
  })

  const hermes = await prisma.agentProduct.upsert({
    where: { slug: 'hermes-agent' },
    update: {},
    create: {
      slug: 'hermes-agent',
      name: 'Hermes AI Agent',
      shortDescription: '설치코드 한 번으로 시작하는 범용 AI 업무 Agent',
      description: '초보자도 쉽게 설치하고 사용하는 AI Linker의 첫 번째 Agent 상품입니다.',
      category: 'productivity',
      purposeTags: JSON.stringify(['업무자동화', '자료정리', 'AI비서']),
      skillLevel: 'beginner',
      supportedPlatforms: JSON.stringify(['WINDOWS', 'IOS']),
      price: 89000,
      status: ProductStatus.ACTIVE,
    },
  })

  const installerFile = await prisma.installerFile.upsert({
    where: { storageKey: 'installers/hermes/windows/1.0.0/AI-Linker-Hermes-Setup.exe' },
    update: {},
    create: {
      fileName: 'AI-Linker-Hermes-Setup.exe',
      storageKey: 'installers/hermes/windows/1.0.0/AI-Linker-Hermes-Setup.exe',
      downloadUrl: '/downloads/AI-Linker-Hermes-Setup.exe',
      platform: Platform.WINDOWS,
      sizeBytes: 52428800n,
      sha256: 'dev-placeholder-sha256',
      uploadedByAdminId: admin.id,
    },
  })

  await prisma.agentRelease.upsert({
    where: {
      agentProductId_platform_version: {
        agentProductId: hermes.id,
        platform: Platform.WINDOWS,
        version: '1.0.0',
      },
    },
    update: {},
    create: {
      agentProductId: hermes.id,
      platform: Platform.WINDOWS,
      version: '1.0.0',
      releaseNotes: 'Gate 2 개발용 Hermes Windows 설치파일 릴리즈입니다.',
      installerFileId: installerFile.id,
      isLatest: true,
      status: ReleaseStatus.PUBLISHED,
    },
  })

  const purchase = await prisma.purchase.create({
    data: {
      userId: user.id,
      agentProductId: hermes.id,
      platform: Platform.WINDOWS,
      status: PurchaseStatus.PAID,
      totalAmount: 89000,
      currency: 'KRW',
    },
  })

  await prisma.payment.create({
    data: {
      purchaseId: purchase.id,
      provider: 'mock',
      paymentKey: `mock-${purchase.id}`,
      amount: 89000,
      currency: 'KRW',
      status: PaymentStatus.PAID,
      paidAt: new Date(),
      rawData: JSON.stringify({ gate: 2, mock: true }),
    },
  })

  const installCode = await prisma.installCode.create({
    data: {
      purchaseId: purchase.id,
      userId: user.id,
      code: 'AIL-DEMO-0001',
      status: InstallCodeStatus.ACTIVE,
      maxActivations: 2,
    },
  })

  await prisma.license.create({
    data: {
      userId: user.id,
      agentProductId: hermes.id,
      purchaseId: purchase.id,
      installCodeId: installCode.id,
      status: LicenseStatus.ACTIVE,
    },
  })

  const wallet = await prisma.creditWallet.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      balanceUsd: 10,
      status: 'ACTIVE',
    },
  })

  await prisma.creditTransaction.create({
    data: {
      walletId: wallet.id,
      userId: user.id,
      type: CreditTransactionType.GRANT_INITIAL,
      amountUsd: 10,
      reason: 'Initial AI Linker trial credit',
    },
  })

  const openRouter = await prisma.lLMProvider.upsert({
    where: { name: 'OpenRouter' },
    update: {},
    create: {
      name: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      status: ProviderStatus.ACTIVE,
    },
  })

  await prisma.lLMAccount.create({
    data: {
      providerId: openRouter.id,
      name: 'openrouter-dev-placeholder',
      apiKeyEncrypted: 'dev-placeholder-never-use-real-key',
      monthlyLimitUsd: 100,
      usedThisMonthUsd: 0,
      status: ProviderStatus.WARNING,
      priority: 10,
    },
  })

  await prisma.lLMModel.upsert({
    where: {
      providerId_modelName: {
        providerId: openRouter.id,
        modelName: 'anthropic/claude-opus-4.6',
      },
    },
    update: {},
    create: {
      providerId: openRouter.id,
      modelName: 'anthropic/claude-opus-4.6',
      displayName: 'Claude Opus 4.6 via OpenRouter',
      inputCostPer1M: 15,
      outputCostPer1M: 75,
      saleInputPricePer1M: 7.5,
      saleOutputPricePer1M: 37.5,
      status: ProviderStatus.ACTIVE,
    },
  })

  await prisma.lLMRoutingPolicy.upsert({
    where: { name: 'default-cost-optimized' },
    update: {},
    create: {
      name: 'default-cost-optimized',
      strategy: 'lowest_cost_active_account',
      allowedProviderIds: JSON.stringify([openRouter.id]),
      allowedModelIds: JSON.stringify([]),
      status: ProviderStatus.ACTIVE,
    },
  })

  const skill = await prisma.skillProduct.upsert({
    where: { slug: 'workflow-starter-pack' },
    update: {},
    create: {
      slug: 'workflow-starter-pack',
      name: 'Workflow Starter Pack',
      description: 'Hermes Agent에 기본 업무자동화 흐름을 추가하는 Skill 패키지입니다.',
      price: 29000,
      billingType: SkillBillingType.ONE_TIME,
      status: ProductStatus.ACTIVE,
      compatibleAgents: {
        create: {
          agentProductId: hermes.id,
        },
      },
    },
  })

  await prisma.skillRelease.create({
    data: {
      skillProductId: skill.id,
      version: '0.1.0',
      releaseNotes: 'Gate 2 개발용 Skill 릴리즈입니다.',
      isLatest: true,
      status: ReleaseStatus.PUBLISHED,
    },
  })

  const post = await prisma.communityPost.create({
    data: {
      userId: user.id,
      agentProductId: hermes.id,
      title: 'Hermes 설치 후기와 질문',
      body: '설치코드로 설치는 완료했고 토큰 사용량 확인 방법이 궁금합니다.',
    },
  })

  await prisma.communityComment.create({
    data: {
      postId: post.id,
      userId: user.id,
      body: '관리자 답변 대기 중인 개발용 댓글입니다.',
    },
  })

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      category: 'install',
      subject: '설치코드 활성화 문의',
      status: TicketStatus.OPEN,
      assignedAdminId: admin.id,
    },
  })

  await prisma.chatMessage.create({
    data: {
      ticketId: ticket.id,
      senderType: SenderType.USER,
      senderId: user.id,
      message: '설치코드를 입력했는데 활성화 상태 확인이 필요합니다.',
    },
  })

  await prisma.auditLog.create({
    data: {
      adminUserId: admin.id,
      action: 'seed.gate2.completed',
      entityType: 'System',
      entityId: 'gate-2',
      afterData: JSON.stringify({ seeded: true }),
      ipAddress: '127.0.0.1',
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
