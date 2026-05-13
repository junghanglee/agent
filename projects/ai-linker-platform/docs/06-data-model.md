# 06. 데이터 모델 초안

## 1. 핵심 엔티티

```text
User
AdminUser
AgentProduct
AgentRelease
InstallerFile
Purchase
Payment
InstallCode
License
DeviceActivation
CreditWallet
CreditTransaction
UsageEvent
LLMProvider
LLMAccount
LLMModel
LLMRoutingPolicy
SkillProduct
SkillRelease
CommunityPost
CommunityComment
SupportTicket
ChatMessage
AuditLog
```

## 2. 사용자/관리자

### User

```text
id
email
name
phone
passwordHash
role
status
createdAt
updatedAt
lastLoginAt
```

### AdminUser

```text
id
email
name
passwordHash
role
status
createdAt
updatedAt
```

## 3. Agent 상품/릴리즈

### AgentProduct

```text
id
slug
name
shortDescription
description
category
purposeTags
skillLevel
supportedPlatforms
price
status
thumbnailUrl
createdAt
updatedAt
```

### AgentRelease

```text
id
agentProductId
platform
version
releaseNotes
installerFileId
isLatest
isRequired
status
createdAt
updatedAt
```

### InstallerFile

```text
id
fileName
storageKey
downloadUrl
platform
sizeBytes
sha256
uploadedByAdminId
createdAt
```

## 4. 구매/결제/설치코드

### Purchase

```text
id
userId
agentProductId
platform
status
totalAmount
currency
createdAt
updatedAt
```

### Payment

```text
id
purchaseId
provider
paymentKey
amount
currency
status
paidAt
cancelledAt
rawData
createdAt
```

### InstallCode

```text
id
purchaseId
userId
code
status
maxActivations
usedActivations
expiresAt
createdAt
usedAt
revokedAt
```

### License

```text
id
userId
agentProductId
purchaseId
installCodeId
status
startsAt
endsAt
createdAt
updatedAt
```

### DeviceActivation

```text
id
licenseId
deviceId
platform
deviceName
activatedAt
lastSeenAt
status
```

## 5. 크레딧/토큰/사용량

### CreditWallet

```text
id
userId
balanceUsd
status
createdAt
updatedAt
```

### CreditTransaction

```text
id
walletId
userId
type
amountUsd
reason
relatedPaymentId
createdAt
```

Transaction type:

```text
charge
grant_initial
usage_deduction
refund
manual_adjustment
```

### UsageEvent

```text
id
userId
agentProductId
licenseId
providerId
modelId
requestId
inputTokens
outputTokens
totalTokens
costUsd
chargedUsd
status
createdAt
```

## 6. LLM Gateway

### LLMProvider

```text
id
name
baseUrl
status
createdAt
updatedAt
```

### LLMAccount

```text
id
providerId
name
apiKeyEncrypted
monthlyLimitUsd
usedThisMonthUsd
status
priority
createdAt
updatedAt
```

### LLMModel

```text
id
providerId
modelName
displayName
inputCostPer1M
outputCostPer1M
saleInputPricePer1M
saleOutputPricePer1M
status
```

### LLMRoutingPolicy

```text
id
name
strategy
allowedProviderIds
allowedModelIds
status
createdAt
updatedAt
```

## 7. Skill/컴포넌트

### SkillProduct

```text
id
slug
name
description
compatibleAgentIds
price
billingType
status
createdAt
updatedAt
```

### SkillRelease

```text
id
skillProductId
version
fileId
releaseNotes
isLatest
status
createdAt
```

## 8. 커뮤니티/상담

### CommunityPost

```text
id
userId
agentProductId
title
body
status
createdAt
updatedAt
```

### CommunityComment

```text
id
postId
userId
body
status
createdAt
updatedAt
```

### SupportTicket

```text
id
userId
category
subject
status
assignedAdminId
createdAt
updatedAt
closedAt
```

### ChatMessage

```text
id
ticketId
senderType
senderId
message
createdAt
```

## 9. 감사 로그

### AuditLog

```text
id
adminUserId
action
entityType
entityId
beforeData
afterData
ipAddress
createdAt
```
