'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useConvexAuth } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { QRCodeSVG } from 'qrcode.react'
import {
  Trophy, Coffee, Apple, Star, Gift, X, Check,
  Loader2, Ticket, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MapOverlayShell } from '@/components/map-overlay-shell'

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  discountPercent: number
  icon: typeof Coffee
  color: string
  bgColor: string
}

const REWARDS: Reward[] = [
  {
    id: 'coffee',
    name: '15% off Coffee',
    description: 'Discount at Café Botanik, Heilbronn Marktplatz',
    pointsCost: 10,
    discountPercent: 15,
    icon: Coffee,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  {
    id: 'fruits',
    name: '10% off Fruits',
    description: 'Fresh fruits at REWE, Kaiserstraße',
    pointsCost: 30,
    discountPercent: 10,
    icon: Apple,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'exclusive',
    name: 'City Hero Badge',
    description: 'Exclusive Pigeon-eye golden badge + 20% at Stadtgalerie',
    pointsCost: 50,
    discountPercent: 20,
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
]

interface RewardsShopProps {
  onBack: () => void
}

export function RewardsShop({ onBack }: RewardsShopProps) {
  const { isLoading: authLoading, isAuthenticated: convexAuthenticated } = useConvexAuth()
  const currentUser = useQuery(api.users.currentUser)
  const userCoupons = useQuery(
    api.coupons.listByUser,
    currentUser ? { user_id: currentUser._id } : 'skip',
  ) ?? []

  const redeemReward = useMutation(api.coupons.redeemReward)

  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [showQR, setShowQR] = useState<{ code: string; reward: Reward } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = convexAuthenticated && currentUser != null
  const isLoading = authLoading || (convexAuthenticated && currentUser === undefined)
  const points = currentUser?.total_points ?? 0

  const activeCoupons = userCoupons
    .filter((c) => c.status === 'active')
    .sort((a, b) => b._creationTime - a._creationTime)

  const handleRedeem = async (reward: Reward) => {
    if (!currentUser) return
    setRedeeming(reward.id)
    setError(null)

    try {
      const result = await redeemReward({
        user_id: currentUser._id,
        reward_name: reward.name,
        discount_percent: reward.discountPercent,
        points_cost: reward.pointsCost,
      })
      setShowQR({ code: result.code, reward })
    } catch (err: unknown) {
      let msg = 'Failed to redeem'
      if (err && typeof err === 'object' && 'data' in err) {
        msg = String((err as { data: unknown }).data)
      } else if (err instanceof Error) {
        msg = err.message
      }
      setError(msg)
    } finally {
      setRedeeming(null)
    }
  }

  return (
    <MapOverlayShell title="Rewards" onClose={onBack}>
      <div className="space-y-4 p-4">
        {isLoading ? (
          <div className="rounded-xl bg-card border border-border p-8 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin" />
            <p className="text-sm">Loading…</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="rounded-xl bg-card border border-border p-6 text-center text-sm text-muted-foreground">
            <Gift className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-card-foreground">Sign in to access rewards</p>
            <p className="mt-1">Earn points by reporting city issues</p>
          </div>
        ) : (
          <>
            {/* Points balance */}
            <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Your Balance</p>
                  <p className="text-3xl font-bold">{points}</p>
                  <p className="text-sm text-white/80">points</p>
                </div>
                <Trophy className="h-12 w-12 text-white/30" />
              </div>
            </div>

            {/* Reward cards */}
            <div className="space-y-3">
              {REWARDS.map((reward) => {
                const Icon = reward.icon
                const canAfford = points >= reward.pointsCost
                const isRedeeming = redeeming === reward.id

                return (
                  <div
                    key={reward.id}
                    className="rounded-xl bg-card border border-border p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-xl ${reward.bgColor} p-3`}>
                        <Icon className={`h-6 w-6 ${reward.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-card-foreground">{reward.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{reward.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            <Trophy className="h-3 w-3" />
                            {reward.pointsCost} pts
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {reward.discountPercent}% discount
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={!canAfford || isRedeeming}
                        onClick={() => handleRedeem(reward)}
                        className={canAfford ? '' : 'opacity-50'}
                      >
                        {isRedeeming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : canAfford ? (
                          'Redeem'
                        ) : (
                          `${reward.pointsCost - points} more`
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            {/* Active coupons */}
            {activeCoupons.length > 0 && (
              <div className="rounded-xl bg-card border border-border">
                <div className="border-b border-border p-4">
                  <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    My Coupons
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {activeCoupons.map((coupon) => (
                    <button
                      key={coupon._id}
                      type="button"
                      onClick={() =>
                        setShowQR({
                          code: coupon.code,
                          reward: REWARDS.find((r) => r.name === coupon.reward_name) ?? {
                            id: 'custom',
                            name: coupon.reward_name ?? 'Reward',
                            description: '',
                            pointsCost: coupon.points_cost,
                            discountPercent: coupon.discount_percent,
                            icon: Gift,
                            color: 'text-primary',
                            bgColor: 'bg-primary/10',
                          },
                        })
                      }
                      className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="rounded-lg bg-green-100 p-2">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-card-foreground text-sm">
                          {coupon.reward_name ?? `${coupon.discount_percent}% discount`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{coupon.code}</span>
                          <span>·</span>
                          <Clock className="h-3 w-3" />
                          <span>{new Date(coupon.expires_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* QR code modal */}
      {showQR && (
        <>
          <div
            className="fixed inset-0 z-[1010] bg-black/60 backdrop-blur-sm"
            onClick={() => setShowQR(null)}
          />
          <div className="fixed inset-0 z-[1011] flex items-center justify-center p-6 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-xs rounded-2xl bg-card border border-border p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-card-foreground">{showQR.reward.name}</h3>
                <button
                  type="button"
                  onClick={() => setShowQR(null)}
                  className="rounded-full p-1 hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex justify-center rounded-xl bg-white p-4">
                <QRCodeSVG
                  value={`pigeon-eye://coupon/${showQR.code}`}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="mt-3 text-center font-mono text-lg font-bold tracking-wider text-card-foreground">
                {showQR.code}
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {showQR.reward.description}
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Show this QR code at the location
              </p>
            </div>
          </div>
        </>
      )}
    </MapOverlayShell>
  )
}
