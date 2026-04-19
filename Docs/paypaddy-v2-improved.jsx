import React, { useState } from 'react';

// ============================================
// PAYPADDY v2 — RESEARCH-INFORMED REDESIGN
// "Trust, Locked." — Universal Escrow
// ============================================
// 
// KEY INSIGHTS DRIVING THIS DESIGN:
// 1. Nigerian users favor "super app" feel (Opay) with ONE clear primary action
// 2. Trust signals must be EVERYWHERE and immediate (NDIC, CBN licensing)
// 3. Text/fonts must be LARGER — accessibility complaint on Opay
// 4. Must work on 2G/offline (USSD fallback like Opay)
// 5. Users expect instant feedback + clear status at every step
// 6. "Paddy" = friend in Nigerian Pidgin — friendly, warm, approachable
// 7. Support for Pidgin English in copy builds emotional trust
// 8. High-fraud context means dispute resolution must be VISIBLE & FAST
// 9. Agent network (physical touchpoints) = massive trust driver
// 10. Social proof (transaction counts, verified badges) critical

// ============================================
// DESIGN TOKENS — Distinctive & Intentional
// ============================================
const tokens = {
  // Primary: Deep emerald (money, trust, Nigerian flag green heritage)
  // Unlike competitors' purple/red, signals financial security without aggression
  ink: '#0A1F1A',
  forest: '#14453D',
  emerald: '#00A86B',
  lime: '#BFFF4F',
  
  // Accent: Warm apricot (warmth of "paddy"/friendship)
  apricot: '#FF9D6E',
  coral: '#FF6B4A',
  
  // Neutrals
  cream: '#FAF7F2',
  sand: '#F0EBE1',
  stone: '#8B8680',
  charcoal: '#1C1C1C',
  
  // Semantic
  safe: '#00A86B',
  caution: '#F5A623',
  alert: '#E94B3C',
  info: '#3D7FFF',
};

// ============================================
// PHONE FRAME
// ============================================
const PhoneFrame = ({ children }) => (
  <div style={{
    width: '300px',
    height: '640px',
    background: tokens.ink,
    borderRadius: '44px',
    padding: '10px',
    boxShadow: '0 30px 80px rgba(10, 31, 26, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
    flexShrink: 0,
  }}>
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: tokens.cream,
      borderRadius: '36px',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100px',
        height: '28px',
        background: '#000',
        borderRadius: '20px',
        zIndex: 100,
      }} />
      {children}
    </div>
  </div>
);

// ============================================
// SCREEN 1: SPLASH — Warm, Trust-First
// ============================================
const SplashScreen = () => (
  <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: tokens.ink,
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* Organic blob background */}
    <div style={{
      position: 'absolute',
      top: '-20%',
      right: '-30%',
      width: '120%',
      height: '60%',
      background: `radial-gradient(ellipse, ${tokens.forest} 0%, transparent 70%)`,
      opacity: 0.8,
    }} />
    <div style={{
      position: 'absolute',
      bottom: '-10%',
      left: '-20%',
      width: '100%',
      height: '40%',
      background: `radial-gradient(ellipse, ${tokens.emerald}30 0%, transparent 70%)`,
    }} />

    {/* Lime accent dot grid */}
    <div style={{
      position: 'absolute',
      top: '50%',
      right: '20px',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      opacity: 0.3,
    }}>
      {[...Array(16)].map((_, i) => (
        <div key={i} style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: tokens.lime,
        }} />
      ))}
    </div>

    {/* Content */}
    <div style={{
      padding: '80px 28px 40px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 2,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '60px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          background: tokens.lime,
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(-8deg)',
        }}>
          <span style={{ fontSize: '22px', transform: 'rotate(8deg)' }}>🔒</span>
        </div>
        <span style={{
          fontSize: '20px',
          fontWeight: '800',
          color: tokens.cream,
          letterSpacing: '-0.5px',
        }}>PayPaddy</span>
      </div>

      {/* Hero copy */}
      <div style={{ marginTop: 'auto', marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '40px',
          fontWeight: '900',
          color: tokens.cream,
          margin: '0 0 16px',
          lineHeight: '1.05',
          letterSpacing: '-1.5px',
        }}>
          No wahala.<br/>
          <span style={{ color: tokens.lime }}>Your money</span><br/>
          is safe.
        </h1>
        <p style={{
          fontSize: '15px',
          color: tokens.sand,
          margin: 0,
          lineHeight: '1.5',
          opacity: 0.8,
        }}>
          The trust layer for any deal — commerce, contracts, bets, services. If one side no deliver, you no lose money.
        </p>
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '100px',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '11px',
          color: tokens.cream,
          fontWeight: '600',
        }}>✓ CBN Licensed</div>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '100px',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '11px',
          color: tokens.cream,
          fontWeight: '600',
        }}>✓ NDIC Insured</div>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '100px',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '11px',
          color: tokens.cream,
          fontWeight: '600',
        }}>✓ NDPR</div>
      </div>

      {/* CTAs */}
      <button style={{
        width: '100%',
        padding: '18px',
        background: tokens.lime,
        color: tokens.ink,
        border: 'none',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '800',
        marginBottom: '10px',
        cursor: 'pointer',
        letterSpacing: '-0.3px',
      }}>
        Create Account
      </button>
      <button style={{
        width: '100%',
        padding: '16px',
        background: 'transparent',
        color: tokens.cream,
        border: 'none',
        fontSize: '14px',
        fontWeight: '600',
      }}>
        I have account → <span style={{ color: tokens.lime }}>Sign in</span>
      </button>
    </div>
  </div>
);

// ============================================
// SCREEN 2: HOME — Super-app style, scan-first
// ============================================
const HomeScreen = () => (
  <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: tokens.cream,
    overflow: 'hidden',
  }}>
    {/* Header with deep green */}
    <div style={{
      background: tokens.ink,
      padding: '52px 20px 28px',
      borderRadius: '0 0 32px 32px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative grid */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
        opacity: 0.15,
      }}>
        {[...Array(9)].map((_, i) => (
          <div key={i} style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: tokens.lime,
          }} />
        ))}
      </div>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: tokens.apricot,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.ink,
            fontSize: '14px',
            fontWeight: '800',
          }}>AO</div>
          <div>
            <p style={{ fontSize: '12px', color: tokens.stone, margin: 0 }}>Welcome back,</p>
            <p style={{ fontSize: '14px', color: tokens.cream, margin: 0, fontWeight: '700' }}>Ade 👋</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            position: 'relative',
          }}>
            🔔
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              background: tokens.coral,
              borderRadius: '50%',
              border: `2px solid ${tokens.ink}`,
            }} />
          </div>
        </div>
      </div>

      {/* Trust Score + Balance - unified card */}
      <div style={{
        background: `linear-gradient(135deg, ${tokens.forest} 0%, ${tokens.emerald} 100%)`,
        borderRadius: '20px',
        padding: '18px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: tokens.lime,
          opacity: 0.15,
        }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: '0 0 4px', letterSpacing: '0.5px', fontWeight: '600' }}>LOCKED IN ESCROW</p>
            <p style={{ fontSize: '26px', fontWeight: '900', color: tokens.cream, margin: 0, letterSpacing: '-0.5px' }}>₦2,450,000</p>
          </div>
          <div style={{
            padding: '6px 10px',
            background: tokens.lime,
            borderRadius: '20px',
            fontSize: '10px',
            color: tokens.ink,
            fontWeight: '800',
            letterSpacing: '0.3px',
          }}>TRINITY ✓</div>
        </div>

        {/* Trust meter */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Trust Score</span>
            <span style={{ fontSize: '11px', color: tokens.lime, fontWeight: '800' }}>850 / 900</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '94%', height: '100%', background: tokens.lime, borderRadius: '3px' }} />
          </div>
        </div>
      </div>
    </div>

    {/* Primary action — big, unmissable */}
    <div style={{ padding: '20px 20px 0' }}>
      <button style={{
        width: '100%',
        padding: '18px',
        background: tokens.ink,
        color: tokens.cream,
        border: 'none',
        borderRadius: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        boxShadow: `0 8px 24px ${tokens.ink}30`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: tokens.lime,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>+</div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '15px', margin: 0, fontWeight: '800' }}>Start a New Deal</p>
            <p style={{ fontSize: '11px', margin: '2px 0 0', opacity: 0.7 }}>Any transaction, any parties</p>
          </div>
        </div>
        <span style={{ fontSize: '20px', color: tokens.lime }}>→</span>
      </button>
    </div>

    {/* Secondary actions */}
    <div style={{ padding: '12px 20px', display: 'flex', gap: '10px' }}>
      {[
        { icon: '🔗', label: 'Join Deal' },
        { icon: '⚡', label: 'Quick Pay' },
        { icon: '🤝', label: 'My Paddys' },
      ].map((action, i) => (
        <div key={i} style={{
          flex: 1,
          background: tokens.cream,
          border: `1.5px solid ${tokens.sand}`,
          borderRadius: '14px',
          padding: '14px 10px',
          textAlign: 'center',
          cursor: 'pointer',
        }}>
          <div style={{ fontSize: '18px', marginBottom: '6px' }}>{action.icon}</div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: tokens.charcoal }}>{action.label}</span>
        </div>
      ))}
    </div>

    {/* Active Deals */}
    <div style={{ padding: '8px 20px 0', flex: 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: tokens.ink, margin: 0, letterSpacing: '-0.3px' }}>
          Active Deals <span style={{ color: tokens.stone, fontWeight: '500' }}>• 4</span>
        </h3>
        <span style={{ fontSize: '12px', color: tokens.emerald, fontWeight: '700' }}>See all →</span>
      </div>

      {[
        { type: '🛍', title: 'MacBook Pro Purchase', party: 'TechHub CV', amount: '₦1,250,000', status: 'Seller Shipping', statusBg: tokens.caution, urgent: true, daysLeft: '2 days left' },
        { type: '⚽', title: 'Arsenal vs Chelsea', party: '@ChuksD', amount: '₦50,000', status: 'Match in 4h', statusBg: tokens.info, urgent: false },
        { type: '✍️', title: 'Logo Design Project', party: 'StartupXYZ', amount: '₦150,000', status: 'Milestone 2/3', statusBg: tokens.emerald, urgent: false },
      ].map((deal, i) => (
        <div key={i} style={{
          background: tokens.cream,
          border: `1.5px solid ${tokens.sand}`,
          borderRadius: '16px',
          padding: '14px',
          marginBottom: '10px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {deal.urgent && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background: tokens.coral,
            }} />
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: tokens.sand,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
            }}>{deal.type}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: tokens.ink, margin: '0 0 2px' }}>{deal.title}</p>
              <p style={{ fontSize: '11px', color: tokens.stone, margin: '0 0 8px' }}>with {deal.party}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: tokens.ink }}>{deal.amount}</span>
                <span style={{
                  background: `${deal.statusBg}20`,
                  color: deal.statusBg,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: '700',
                }}>{deal.status}</span>
              </div>
              {deal.daysLeft && (
                <p style={{ fontSize: '10px', color: tokens.coral, margin: '6px 0 0', fontWeight: '600' }}>⏱ {deal.daysLeft}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Bottom Nav */}
    <div style={{
      padding: '12px 20px 28px',
      background: tokens.cream,
      borderTop: `1px solid ${tokens.sand}`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
    }}>
      {[
        { icon: '⌂', label: 'Home', active: true },
        { icon: '📋', label: 'Deals', active: false },
        { icon: '💬', label: 'Chat', active: false, badge: 3 },
        { icon: '◉', label: 'Me', active: false },
      ].map((item, i) => (
        <div key={i} style={{ textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
          <div style={{
            fontSize: '22px',
            color: item.active ? tokens.emerald : tokens.stone,
            marginBottom: '2px',
            fontWeight: item.active ? 'bold' : 'normal',
          }}>{item.icon}</div>
          <span style={{
            fontSize: '10px',
            color: item.active ? tokens.emerald : tokens.stone,
            fontWeight: item.active ? '800' : '600',
          }}>{item.label}</span>
          {item.badge && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '10px',
              background: tokens.coral,
              color: '#fff',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '9px',
              fontWeight: '800',
            }}>{item.badge}</div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// SCREEN 3: CREATE DEAL - Smart Type Selection
// ============================================
const CreateDealScreen = () => (
  <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: tokens.cream,
  }}>
    <div style={{ padding: '52px 20px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: tokens.sand,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
        }}>←</div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: tokens.ink, letterSpacing: '-0.8px' }}>Start a Deal</h2>
      </div>
      <p style={{ fontSize: '13px', color: tokens.stone, margin: '0 0 0 48px' }}>Wetin you wan do?</p>
    </div>

    {/* Deal types — 2x2 grid + custom */}
    <div style={{ padding: '12px 20px', flex: 1, overflow: 'auto' }}>
      {/* Quick suggestion based on AI context */}
      <div style={{
        background: tokens.ink,
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: tokens.lime,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0,
        }}>✨</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', color: tokens.lime, margin: 0, fontWeight: '700', letterSpacing: '0.3px' }}>SUGGESTED</p>
          <p style={{ fontSize: '13px', color: tokens.cream, margin: '2px 0 0', fontWeight: '600' }}>Continue MacBook deal draft?</p>
        </div>
        <span style={{ color: tokens.lime, fontSize: '18px' }}>→</span>
      </div>

      <p style={{ fontSize: '11px', color: tokens.stone, fontWeight: '700', letterSpacing: '0.8px', margin: '0 0 10px' }}>CHOOSE DEAL TYPE</p>

      {/* Primary 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        {[
          { icon: '🛍', title: 'Buy / Sell', desc: 'Products & goods', accent: tokens.emerald, popular: true },
          { icon: '🔧', title: 'Service', desc: 'Freelance work', accent: tokens.info },
          { icon: '📑', title: 'Contract', desc: 'Milestones', accent: tokens.apricot },
          { icon: '🎲', title: 'Bet / Wager', desc: 'Predictions', accent: tokens.caution },
        ].map((type, i) => (
          <div key={i} style={{
            background: tokens.cream,
            border: `1.5px solid ${tokens.sand}`,
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            position: 'relative',
            minHeight: '110px',
          }}>
            {type.popular && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: tokens.lime,
                color: tokens.ink,
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '9px',
                fontWeight: '800',
              }}>POPULAR</div>
            )}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `${type.accent}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              marginBottom: '10px',
            }}>{type.icon}</div>
            <p style={{ fontSize: '14px', fontWeight: '800', color: tokens.ink, margin: '0 0 2px' }}>{type.title}</p>
            <p style={{ fontSize: '11px', color: tokens.stone, margin: 0 }}>{type.desc}</p>
          </div>
        ))}
      </div>

      {/* Custom — distinct */}
      <div style={{
        background: tokens.ink,
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: tokens.lime,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}>🤝</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: '800', color: tokens.cream, margin: '0 0 2px' }}>Custom Deal</p>
          <p style={{ fontSize: '11px', color: tokens.stone, margin: 0 }}>Define your own terms — any parties, any conditions</p>
        </div>
        <span style={{ color: tokens.lime, fontSize: '18px' }}>→</span>
      </div>

      {/* Info box */}
      <div style={{
        marginTop: '16px',
        padding: '14px',
        background: `${tokens.emerald}10`,
        borderLeft: `3px solid ${tokens.emerald}`,
        borderRadius: '8px',
      }}>
        <p style={{ fontSize: '12px', color: tokens.forest, margin: 0, lineHeight: '1.5' }}>
          <strong>All deals are escrow-protected.</strong> Your money stays locked with our CBN-licensed bank partner until conditions are met.
        </p>
      </div>
    </div>
  </div>
);

// ============================================
// SCREEN 4: DEAL ROOM — The Crown Jewel
// ============================================
const DealRoomScreen = () => (
  <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: tokens.cream,
  }}>
    {/* Header */}
    <div style={{ padding: '52px 20px 12px', background: tokens.cream, display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: tokens.sand,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
      }}>←</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: tokens.ink, letterSpacing: '-0.3px' }}>MacBook Pro Purchase</p>
        <p style={{ fontSize: '10px', color: tokens.stone, margin: 0 }}>Deal #PP-4829</p>
      </div>
      <span style={{ fontSize: '18px' }}>⋯</span>
    </div>

    {/* HERO: Escrow vault visualization */}
    <div style={{ padding: '4px 20px 16px' }}>
      <div style={{
        background: tokens.ink,
        borderRadius: '24px',
        padding: '24px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: tokens.emerald,
          opacity: 0.2,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: tokens.lime,
          opacity: 0.1,
        }} />

        <div style={{ position: 'relative' }}>
          {/* Lock icon */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: tokens.lime,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            marginBottom: '14px',
          }}>🔒</div>

          <p style={{ fontSize: '11px', color: tokens.stone, margin: '0 0 4px', letterSpacing: '0.5px', fontWeight: '700' }}>LOCKED IN ESCROW</p>
          <p style={{ fontSize: '32px', fontWeight: '900', color: tokens.cream, margin: '0 0 4px', letterSpacing: '-1px' }}>₦1,250,000</p>
          <p style={{ fontSize: '11px', color: tokens.lime, margin: '0 0 20px', fontWeight: '600' }}>with GTBank (CBN Licensed)</p>

          {/* Progress - visual milestones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
            {['Created', 'Funded', 'Delivery', 'Done'].map((step, i) => {
              const states = ['done', 'done', 'active', 'pending'];
              const state = states[i];
              return (
                <React.Fragment key={i}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: state === 'done' ? tokens.lime : state === 'active' ? tokens.apricot : 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: state === 'pending' ? tokens.stone : tokens.ink,
                    fontWeight: '800',
                    position: 'relative',
                    zIndex: 2,
                  }}>{state === 'done' ? '✓' : i + 1}</div>
                  {i < 3 && (
                    <div style={{
                      flex: 1,
                      height: '3px',
                      background: i < 2 ? tokens.lime : 'rgba(255,255,255,0.15)',
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {['Created', 'Funded', 'Delivery', 'Done'].map((step, i) => (
              <span key={i} style={{
                fontSize: '9px',
                color: i === 2 ? tokens.apricot : (i < 2 ? tokens.lime : tokens.stone),
                fontWeight: '700',
              }}>{step}</span>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Parties */}
    <div style={{ padding: '0 20px 12px' }}>
      <div style={{
        background: tokens.cream,
        border: `1.5px solid ${tokens.sand}`,
        borderRadius: '14px',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: tokens.apricot,
          color: tokens.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '800',
        }}>AO</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: tokens.ink, margin: 0 }}>You (Buyer)</p>
          <p style={{ fontSize: '10px', color: tokens.emerald, margin: 0, fontWeight: '600' }}>✓ Paid ₦1.25M</p>
        </div>
        
        {/* Handshake divider */}
        <div style={{
          width: '1px',
          height: '24px',
          background: tokens.sand,
          margin: '0 4px',
        }} />
        
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: tokens.forest,
          color: tokens.cream,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '800',
        }}>TH</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: tokens.ink, margin: 0 }}>TechHub CV</p>
          <p style={{ fontSize: '10px', color: tokens.caution, margin: 0, fontWeight: '600' }}>⏳ Delivering</p>
        </div>
      </div>
    </div>

    {/* Activity feed with chat capability */}
    <div style={{ padding: '0 20px 12px', flex: 1, overflow: 'auto' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', color: tokens.stone, letterSpacing: '0.5px', margin: '0 0 10px' }}>ACTIVITY</p>
      
      {[
        { type: 'system', icon: '🔒', text: 'Escrow funded ₦1,250,000', time: '2:34 PM', self: false },
        { type: 'message', avatar: 'TH', text: 'Your item is ready. Meeting point: Shop 45, Computer Village. When are you coming?', time: '2:45 PM', self: false },
        { type: 'message', avatar: 'AO', text: 'I\'ll be there by 4pm today. Thanks!', time: '2:47 PM', self: true },
        { type: 'system', icon: '📦', text: 'TechHub CV marked as "Ready for pickup"', time: '3:12 PM', self: false },
      ].map((item, i) => {
        if (item.type === 'system') {
          return (
            <div key={i} style={{
              background: `${tokens.emerald}10`,
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: tokens.forest, margin: 0, fontWeight: '600' }}>{item.text}</p>
              </div>
              <span style={{ fontSize: '10px', color: tokens.stone }}>{item.time}</span>
            </div>
          );
        }
        return (
          <div key={i} style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '8px',
            flexDirection: item.self ? 'row-reverse' : 'row',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: item.self ? tokens.apricot : tokens.forest,
              color: item.self ? tokens.ink : tokens.cream,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '800',
              flexShrink: 0,
            }}>{item.avatar}</div>
            <div style={{
              background: item.self ? tokens.ink : tokens.sand,
              color: item.self ? tokens.cream : tokens.ink,
              borderRadius: '14px',
              padding: '10px 14px',
              maxWidth: '70%',
              borderTopLeftRadius: item.self ? '14px' : '4px',
              borderTopRightRadius: item.self ? '4px' : '14px',
            }}>
              <p style={{ fontSize: '12px', margin: 0, lineHeight: '1.4' }}>{item.text}</p>
              <p style={{ fontSize: '9px', margin: '4px 0 0', opacity: 0.6 }}>{item.time}</p>
            </div>
          </div>
        );
      })}
    </div>

    {/* ACTION BAR — Two distinct paths */}
    <div style={{ padding: '12px 20px 24px', background: tokens.cream, borderTop: `1px solid ${tokens.sand}` }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button style={{
          flex: 1,
          padding: '16px',
          background: tokens.emerald,
          color: '#fff',
          border: 'none',
          borderRadius: '14px',
          fontSize: '14px',
          fontWeight: '800',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          ✓ I got the item
        </button>
        <button style={{
          width: '50px',
          padding: '16px',
          background: tokens.cream,
          color: tokens.ink,
          border: `1.5px solid ${tokens.sand}`,
          borderRadius: '14px',
          fontSize: '16px',
          cursor: 'pointer',
        }}>💬</button>
      </div>
      <button style={{
        width: '100%',
        padding: '10px',
        background: 'transparent',
        color: tokens.alert,
        border: 'none',
        fontSize: '12px',
        fontWeight: '700',
      }}>
        ⚠️ Report a problem
      </button>
    </div>
  </div>
);

// ============================================
// SCREEN 5: TRINITY VERIFY — Improved flow
// ============================================
const TrinityScreen = () => (
  <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: tokens.ink,
  }}>
    <div style={{ padding: '52px 20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: tokens.cream,
        }}>←</div>
        <span style={{ fontSize: '12px', color: tokens.stone, fontWeight: '600' }}>Step 2 of 3</span>
      </div>

      <h2 style={{ fontSize: '26px', fontWeight: '900', color: tokens.cream, margin: '0 0 8px', letterSpacing: '-0.8px', lineHeight: '1.1' }}>
        One quick<br/>verification left
      </h2>
      <p style={{ fontSize: '14px', color: tokens.stone, margin: 0 }}>Your NIN, and we dey go</p>
    </div>

    {/* Progress */}
    <div style={{ padding: '0 20px 24px' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        {['BVN', 'NIN', 'Face'].map((step, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{
              height: '4px',
              background: i === 0 ? tokens.lime : i === 1 ? tokens.apricot : 'rgba(255,255,255,0.15)',
              borderRadius: '2px',
              marginBottom: '6px',
            }} />
            <p style={{
              fontSize: '10px',
              color: i < 2 ? (i === 0 ? tokens.lime : tokens.apricot) : tokens.stone,
              fontWeight: '700',
              margin: 0,
              letterSpacing: '0.5px',
            }}>{step}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Input */}
    <div style={{ padding: '0 20px', flex: 1 }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1.5px solid ${tokens.apricot}`,
        borderRadius: '18px',
        padding: '20px',
      }}>
        <label style={{ fontSize: '11px', color: tokens.apricot, fontWeight: '800', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>YOUR NIN</label>
        
        {/* NIN digit cells */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0].map((digit, i) => (
            <div key={i} style={{
              flex: 1,
              height: '44px',
              background: i < 5 ? tokens.cream : 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '800',
              color: i < 5 ? tokens.ink : tokens.stone,
              border: i === 5 ? `2px solid ${tokens.apricot}` : 'none',
            }}>{i < 5 ? '•' : ''}</div>
          ))}
        </div>

        <p style={{ fontSize: '11px', color: tokens.stone, margin: 0, lineHeight: '1.5' }}>
          We check against NIMC records. Your data is encrypted and never shared.
        </p>
      </div>

      {/* Why trinity */}
      <div style={{
        marginTop: '16px',
        padding: '14px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        display: 'flex',
        gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>🛡️</span>
        <div>
          <p style={{ fontSize: '12px', color: tokens.cream, margin: 0, fontWeight: '700' }}>Why 3 checks?</p>
          <p style={{ fontSize: '11px', color: tokens.stone, margin: '2px 0 0', lineHeight: '1.5' }}>
            One human = one account. This stops fraudsters from creating fake identities. E dey for your own safety.
          </p>
        </div>
      </div>
    </div>

    {/* Number pad hint */}
    <div style={{ padding: '0 20px 24px' }}>
      <button style={{
        width: '100%',
        padding: '18px',
        background: tokens.lime,
        color: tokens.ink,
        border: 'none',
        borderRadius: '16px',
        fontSize: '15px',
        fontWeight: '900',
        cursor: 'pointer',
        letterSpacing: '-0.3px',
      }}>
        Verify NIN →
      </button>
    </div>
  </div>
);

// ============================================
// SCREEN 6: DISPUTE — CRITICAL for low-trust markets
// ============================================
const DisputeScreen = () => (
  <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: tokens.cream,
  }}>
    {/* Alert header */}
    <div style={{
      background: tokens.alert,
      padding: '52px 20px 16px',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '16px', color: tokens.cream }}>←</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: tokens.cream }}>Report a Problem</span>
      </div>
      <h2 style={{ fontSize: '22px', fontWeight: '900', color: tokens.cream, margin: 0, lineHeight: '1.2', letterSpacing: '-0.5px' }}>
        Money no go waka.<br/>Tell us wetin happen.
      </h2>
    </div>

    {/* Reassurance */}
    <div style={{ padding: '16px 20px 12px' }}>
      <div style={{
        background: `${tokens.emerald}15`,
        border: `1px solid ${tokens.emerald}30`,
        borderRadius: '12px',
        padding: '14px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '18px' }}>🛡️</span>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '800', color: tokens.forest, margin: '0 0 2px' }}>Your ₦1,250,000 is safe</p>
          <p style={{ fontSize: '11px', color: tokens.forest, margin: 0, opacity: 0.8, lineHeight: '1.5' }}>
            Funds stay locked till we investigate. Average resolution: <strong>24 hours</strong>.
          </p>
        </div>
      </div>
    </div>

    {/* Issue selection */}
    <div style={{ padding: '0 20px', flex: 1, overflow: 'auto' }}>
      <p style={{ fontSize: '11px', fontWeight: '800', color: tokens.stone, letterSpacing: '0.5px', margin: '12px 0 12px' }}>
        WETIN HAPPEN?
      </p>

      {[
        { icon: '📦', title: 'Item never arrived', desc: 'No delivery, no communication' },
        { icon: '💔', title: 'Item not as described', desc: 'Wrong color, damaged, fake' },
        { icon: '🧩', title: 'Incomplete delivery', desc: 'Missing parts or accessories' },
        { icon: '👤', title: 'Seller unresponsive', desc: 'Not answering my messages' },
        { icon: '❓', title: 'Something else', desc: 'Describe your issue' },
      ].map((issue, i) => (
        <div key={i} style={{
          background: tokens.cream,
          border: `1.5px solid ${i === 0 ? tokens.alert : tokens.sand}`,
          borderRadius: '14px',
          padding: '14px',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          position: 'relative',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: i === 0 ? `${tokens.alert}15` : tokens.sand,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>{issue.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: tokens.ink, margin: '0 0 2px' }}>{issue.title}</p>
            <p style={{ fontSize: '11px', color: tokens.stone, margin: 0 }}>{issue.desc}</p>
          </div>
          {i === 0 && (
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: tokens.alert,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '800',
            }}>✓</div>
          )}
        </div>
      ))}

      {/* Evidence upload */}
      <p style={{ fontSize: '11px', fontWeight: '800', color: tokens.stone, letterSpacing: '0.5px', margin: '20px 0 12px' }}>
        ADD EVIDENCE (OPTIONAL)
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
      }}>
        {[1, 2, 3].map((_, i) => (
          <div key={i} style={{
            aspectRatio: '1',
            background: tokens.sand,
            borderRadius: '12px',
            border: `2px dashed ${tokens.stone}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: tokens.stone,
          }}>+</div>
        ))}
      </div>
    </div>

    {/* Submit */}
    <div style={{ padding: '16px 20px 24px', background: tokens.cream, borderTop: `1px solid ${tokens.sand}` }}>
      <button style={{
        width: '100%',
        padding: '18px',
        background: tokens.ink,
        color: tokens.cream,
        border: 'none',
        borderRadius: '16px',
        fontSize: '15px',
        fontWeight: '800',
        cursor: 'pointer',
      }}>
        Submit Dispute
      </button>
      <p style={{ fontSize: '10px', color: tokens.stone, textAlign: 'center', margin: '8px 0 0' }}>
        A human paddy (not bot) will review within 24h
      </p>
    </div>
  </div>
);

// ============================================
// SCREEN 7: USSD / OFFLINE MODE
// ============================================
const USSDScreen = () => (
  <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: tokens.ink,
  }}>
    {/* Header */}
    <div style={{ padding: '52px 20px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: tokens.cream,
        }}>←</div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: tokens.cream, margin: 0 }}>Pay Offline</h2>
      </div>
    </div>

    {/* Offline indicator */}
    <div style={{ padding: '0 20px 16px' }}>
      <div style={{
        background: 'rgba(255, 157, 110, 0.15)',
        border: `1px solid ${tokens.apricot}40`,
        borderRadius: '12px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: tokens.apricot,
        }} />
        <div>
          <p style={{ fontSize: '12px', color: tokens.apricot, margin: 0, fontWeight: '700' }}>Data no dey? No wahala.</p>
          <p style={{ fontSize: '10px', color: tokens.stone, margin: 0 }}>Pay with USSD from any phone</p>
        </div>
      </div>
    </div>

    {/* USSD Code Display */}
    <div style={{ padding: '0 20px 16px' }}>
      <div style={{
        background: tokens.cream,
        borderRadius: '20px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '11px', color: tokens.stone, margin: '0 0 12px', letterSpacing: '0.8px', fontWeight: '700' }}>
          DIAL THIS CODE
        </p>
        
        {/* Giant USSD code */}
        <div style={{
          background: tokens.ink,
          borderRadius: '16px',
          padding: '24px 12px',
          marginBottom: '12px',
        }}>
          <p style={{
            fontSize: '28px',
            fontWeight: '900',
            color: tokens.lime,
            margin: 0,
            fontFamily: 'monospace',
            letterSpacing: '1px',
          }}>*999*1*4829#</p>
        </div>

        {/* Copy button */}
        <button style={{
          padding: '10px 24px',
          background: tokens.sand,
          color: tokens.ink,
          border: 'none',
          borderRadius: '100px',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
        }}>
          📋 Copy code
        </button>

        <p style={{ fontSize: '11px', color: tokens.stone, margin: '16px 0 0', lineHeight: '1.5' }}>
          Code expires in <strong style={{ color: tokens.alert }}>04:52</strong>
        </p>
      </div>
    </div>

    {/* Steps */}
    <div style={{ padding: '0 20px', flex: 1 }}>
      <p style={{ fontSize: '11px', fontWeight: '800', color: tokens.stone, letterSpacing: '0.5px', margin: '0 0 12px' }}>
        HOW IT WORK
      </p>
      {[
        { n: 1, text: 'Dial the code from your registered SIM' },
        { n: 2, text: 'Enter your bank PIN to authorize ₦1,250,000' },
        { n: 3, text: 'Get SMS confirmation instantly' },
      ].map((step, i) => (
        <div key={i} style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '12px',
          alignItems: 'flex-start',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: tokens.lime,
            color: tokens.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '800',
            flexShrink: 0,
          }}>{step.n}</div>
          <p style={{ fontSize: '13px', color: tokens.cream, margin: 0, lineHeight: '1.5', paddingTop: '4px' }}>
            {step.text}
          </p>
        </div>
      ))}
    </div>

    {/* Agent option */}
    <div style={{ padding: '0 20px 24px' }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '14px',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: tokens.apricot,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
        }}>📍</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', color: tokens.cream, margin: 0, fontWeight: '700' }}>No SIM? Find an Agent</p>
          <p style={{ fontSize: '10px', color: tokens.stone, margin: 0 }}>12 PayPaddy agents within 2km</p>
        </div>
        <span style={{ color: tokens.lime }}>→</span>
      </div>
    </div>
  </div>
);

// ============================================
// DESIGN NOTES SCREEN
// ============================================
const DesignNotesScreen = () => (
  <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: tokens.ink,
    padding: '52px 20px 20px',
    overflow: 'auto',
  }}>
    <h2 style={{ fontSize: '22px', fontWeight: '900', color: tokens.cream, margin: '0 0 16px', letterSpacing: '-0.5px' }}>
      Why these changes?
    </h2>

    {[
      {
        icon: '🇳🇬',
        title: 'Nigerian voice',
        text: 'Pidgin micro-copy ("No wahala", "Wetin happen?") builds emotional trust. Competitors use sterile English.',
      },
      {
        icon: '🌿',
        title: 'Green, not red',
        text: 'Every fintech uses red/purple. Emerald signals money + Nigerian heritage. Lime accent is unforgettable.',
      },
      {
        icon: '📏',
        title: 'Larger type',
        text: 'Opay reviews cite small fonts as accessibility issue. We bumped body to 13-14px minimum.',
      },
      {
        icon: '⚡',
        title: 'One primary action',
        text: 'Super-app layout: "Start a New Deal" dominates. Secondary actions are smaller chips.',
      },
      {
        icon: '🛡️',
        title: 'Trust signals first',
        text: 'CBN/NDIC/NDPR badges on splash. Vault metaphor on deal rooms. Dispute flow reassures before asking.',
      },
      {
        icon: '📶',
        title: 'Offline-first',
        text: 'USSD code is the HERO on its screen (28px, monospace). Agent finder as fallback.',
      },
      {
        icon: '⚖️',
        title: 'Fast dispute path',
        text: 'Red-bordered "Report a problem" always visible. 24h SLA stated upfront. "Human paddy, not bot" copy.',
      },
      {
        icon: '🎯',
        title: 'Scannable deal states',
        text: 'Left-edge color bar on urgent deals. Time-left warnings. Status chips use semantic colors consistently.',
      },
    ].map((note, i) => (
      <div key={i} style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '14px',
        padding: '14px',
        marginBottom: '10px',
        display: 'flex',
        gap: '12px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: tokens.lime,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0,
        }}>{note.icon}</div>
        <div>
          <p style={{ fontSize: '13px', color: tokens.cream, margin: '0 0 4px', fontWeight: '800' }}>{note.title}</p>
          <p style={{ fontSize: '11px', color: tokens.stone, margin: 0, lineHeight: '1.5' }}>{note.text}</p>
        </div>
      </div>
    ))}
  </div>
);

// ============================================
// MAIN APP
// ============================================
export default function PayPaddyV2() {
  const [activeScreen, setActiveScreen] = useState(0);

  const screens = [
    { id: 'splash', label: 'Splash', component: SplashScreen },
    { id: 'home', label: 'Home', component: HomeScreen },
    { id: 'create', label: 'Create Deal', component: CreateDealScreen },
    { id: 'room', label: 'Deal Room', component: DealRoomScreen },
    { id: 'trinity', label: 'Trinity', component: TrinityScreen },
    { id: 'dispute', label: 'Dispute', component: DisputeScreen },
    { id: 'ussd', label: 'USSD', component: USSDScreen },
    { id: 'notes', label: '💡 Notes', component: DesignNotesScreen },
  ];

  const CurrentScreen = screens[activeScreen].component;

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${tokens.ink} 0%, ${tokens.forest} 100%)`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: tokens.lime,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            transform: 'rotate(-6deg)',
          }}>🔒</div>
          <div>
            <h1 style={{ color: tokens.cream, fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '-0.8px' }}>
              PayPaddy v2
            </h1>
            <p style={{ color: tokens.lime, fontSize: '13px', margin: 0, fontWeight: '600' }}>
              Research-informed redesign · "No wahala"
            </p>
          </div>
        </div>
      </div>

      {/* Screen tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        background: 'rgba(255,255,255,0.04)',
        padding: '8px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {screens.map((screen, i) => (
          <button
            key={screen.id}
            onClick={() => setActiveScreen(i)}
            style={{
              padding: '10px 14px',
              background: activeScreen === i ? tokens.lime : 'transparent',
              color: activeScreen === i ? tokens.ink : tokens.stone,
              border: 'none',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {screen.label}
          </button>
        ))}
      </div>

      {/* Phone display */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <PhoneFrame>
          <CurrentScreen />
        </PhoneFrame>
      </div>

      {/* Description */}
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '20px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <h3 style={{ color: tokens.cream, fontSize: '15px', fontWeight: '800', margin: '0 0 8px' }}>
          {screens[activeScreen].label}
        </h3>
        <p style={{ color: tokens.stone, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
          {activeScreen === 0 && "Splash reframes the value prop in Nigerian Pidgin: 'No wahala. Your money is safe.' Trust badges (CBN, NDIC, NDPR) appear above the CTA — not hidden in T&Cs."}
          {activeScreen === 1 && "Home leads with TWO unified cards: locked escrow balance + trust score. Primary 'New Deal' button is dominant. Urgent deals flagged with red edge-bar + time-left warnings."}
          {activeScreen === 2 && "Smart entry: AI suggests continuing drafts. 2x2 grid for common deal types with 'POPULAR' badge. Custom deal gets distinct dark treatment to signal power-user flexibility."}
          {activeScreen === 3 && "The crown jewel. Vault metaphor — giant locked amount with bank partner name for credibility. 4-stage milestone progress with color semantics. Unified parties row with handshake divider. WhatsApp-style chat built into the deal."}
          {activeScreen === 4 && "Trinity verification uses Pidgin copy ('we dey go') to feel human. 'Why 3 checks?' explains reasoning — transparency beats friction. NIN input uses digit cells for clarity on small screens."}
          {activeScreen === 5 && "Dispute flow LEADS with reassurance ('Your ₦1.25M is safe') before asking what went wrong. Pre-categorized issues speed up reporting. '24h resolution · human not bot' sets expectation."}
          {activeScreen === 6 && "USSD mode makes the CODE the hero (28px monospace lime on black). Expiry timer creates urgency. Agent finder as offline-offline fallback. Critical for 2G/rural reach."}
          {activeScreen === 7 && "Design rationale for each major change — based on Nigerian fintech UX research, Opay/Kuda/Palmpay benchmarking, and escrow fraud pain points."}
        </p>
      </div>

      {/* Key differentiators */}
      <div style={{
        maxWidth: '480px',
        margin: '20px auto 0',
        padding: '20px',
        background: tokens.lime,
        borderRadius: '16px',
      }}>
        <p style={{ fontSize: '11px', color: tokens.ink, fontWeight: '800', letterSpacing: '0.8px', margin: '0 0 8px' }}>
          CROWN JEWEL DIFFERENTIATORS
        </p>
        <p style={{ fontSize: '13px', color: tokens.ink, margin: 0, lineHeight: '1.6', fontWeight: '500' }}>
          1. <strong>Universal</strong> — not just buy/sell (bets, contracts, deals, services)<br/>
          2. <strong>Pidgin-native</strong> — emotional connection competitors miss<br/>
          3. <strong>Vault visualization</strong> — money feels LOCKED, not just "held"<br/>
          4. <strong>Offline-first</strong> — USSD + agents for the 28M unbanked<br/>
          5. <strong>Dispute-transparent</strong> — 24h SLA stated upfront
        </p>
      </div>
    </div>
  );
}
