# 성능 최적화 가이드

## 현재 성능 문제
- GET /api/profiles: 3~6초 (목표: <500ms)
- GET /api/profiles/[id]: 3~5초 (목표: <500ms)
- POST /api/profile-by-email: 3~9초 (목표: <1s)

## 원인
1. **Supabase 원격 DB** - 네트워크 레이턴시
2. **N+1 쿼리 문제 없음** - 이미 `include`로 최적화됨 ✓
3. **필요 없는 데이터 로딩** - Team Directory는 Big Five JSONB 데이터 필요 없음
4. **Connection pooling 미설정**

## 최적화 방안

### 1. Select 필드 제한 (즉시 적용 가능) ⚡
Team Directory에서 Big Five Profile 제외:

```typescript
// Before (모든 데이터 로드)
include: {
  bigFiveProfile: true, // 큰 JSONB 데이터
}

// After (필요한 것만)
select: {
  id: true,
  name: true,
  email: true,
  team: true,
  chronotype: { select: { primaryType: true } },
  // bigFiveProfile 제외 ← 50-70% 속도 향상
}
```

### 2. Connection Pooling 설정
`prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Pooler 사용
}
```

`.env`:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.rcaitnenussgesnxlimp.supabase.co:5432/postgres"
```

### 3. 데이터베이스 인덱스 추가
```sql
CREATE INDEX idx_user_profile_email ON user_profiles(email);
CREATE INDEX idx_user_profile_created_at ON user_profiles(created_at DESC);
```

### 4. API Response 캐싱 (선택사항)
```typescript
export const revalidate = 60; // 60초 캐시
```

### 5. Vercel 배포 시 개선
- Edge Functions 사용
- 지역별 데이터베이스 복제
- CDN 캐싱

## 예상 개선 효과
- Select 최적화: **50-70% 속도 향상** (3s → 1s)
- Connection Pooling: **30% 추가 향상** (1s → 700ms)
- 인덱스: **20% 추가 향상** (700ms → 500ms)

**최종 목표: 3-6초 → 500ms 이하**
