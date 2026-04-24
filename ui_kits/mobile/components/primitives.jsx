// PayPaddy primitive components — colors and type from design system

const PP = {
  ink: '#0A1F1A', forest: '#14453D', emerald: '#00A86B', lime: '#BFFF4F',
  apricot: '#FF9D6E', coral: '#FF6B4A', cream: '#FAF7F2', sand: '#F0EBE1',
  stone: '#8B8680', charcoal: '#1C1C1C', caution: '#F5A623', alert: '#E94B3C', info: '#3D7FFF'
};

// THEME — swappable via Tweaks. Two balances:
//   v1 "Electric" — ink background + lime hero action. High-energy, original mockup.
//   v2 "Warm Trust" — forest background + emerald hero action, apricot accents, lime demoted.
const THEMES = {
  v1: {
    heroBg: PP.ink,
    primary: PP.lime,
    primaryFg: PP.ink,
    accent: PP.apricot,
    highlight: PP.lime,
    vaultGrad: `linear-gradient(135deg, ${PP.forest} 0%, ${PP.emerald} 100%)`,
    headerGrad: 'linear-gradient(135deg,#0A1F1A,#14453D)',
  },
  v2: {
    heroBg: PP.forest,
    primary: PP.emerald,
    primaryFg: '#fff',
    accent: PP.apricot,
    highlight: PP.lime,
    vaultGrad: `linear-gradient(135deg, ${PP.ink} 0%, ${PP.forest} 100%)`,
    headerGrad: `linear-gradient(135deg, ${PP.forest} 0%, #0d5c4f 100%)`,
  },
};
window.THEMES = THEMES;
window.getTheme = () => THEMES[window.__ppTheme || 'v2'];

// Primary CTA — respects theme
const PrimaryButton = ({ children, onClick, style }) => {
  const T = getTheme();
  return (
    <button onClick={onClick} style={{
      width:'100%',padding:'16px',background:T.primary,color:T.primaryFg,border:'none',
      borderRadius:14,fontSize:15,fontWeight:900,letterSpacing:'-.3px',cursor:'pointer',
      fontFamily:'inherit',...style
    }}>{children}</button>
  );
};

// Ink-on-cream large CTA (Start a New Deal)
const DarkButton = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{
    width:'100%',padding:'14px',background:PP.ink,color:PP.cream,border:'none',
    borderRadius:14,fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',
    boxShadow:'0 8px 24px rgba(10,31,26,.3)',display:'flex',alignItems:'center',
    justifyContent:'center',gap:8,...style
  }}>{children}</button>
);

// Emerald confirm button (I got the item)
const EmeraldButton = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{
    flex:1,padding:'14px',background:PP.emerald,color:'#fff',border:'none',
    borderRadius:12,fontSize:13,fontWeight:800,cursor:'pointer',fontFamily:'inherit',
    display:'flex',alignItems:'center',justifyContent:'center',gap:6,...style
  }}>{children}</button>
);

// Trust pill (used under hero on dark surfaces)
const TrustPill = ({ children }) => (
  <span style={{
    padding:'5px 11px',background:'rgba(255,255,255,.08)',borderRadius:999,
    border:'1px solid rgba(255,255,255,.1)',fontSize:10,color:PP.cream,fontWeight:700
  }}>{children}</span>
);

// TRINITY ✓ badge
const TrinityBadge = () => {
  const T = getTheme();
  return (
    <span style={{
      padding:'4px 10px',borderRadius:999,background:T.highlight,color:PP.ink,
      fontSize:10,fontWeight:800,letterSpacing:'.3px'
    }}>TRINITY ✓</span>
  );
};

// Section eyebrow label (LOCKED IN ESCROW, ACTIVE DEALS, etc)
const Eyebrow = ({ children, color = PP.stone, style }) => (
  <p style={{
    fontSize:10,fontWeight:800,letterSpacing:'.8px',textTransform:'uppercase',
    color,margin:0,...style
  }}>{children}</p>
);

// The vault — brand signature
const VaultCard = ({ amount, bank, icon = '🔒', label = 'LOCKED IN ESCROW', style }) => {
  const T = getTheme();
  return (
    <div style={{
      background: T.vaultGrad,
      borderRadius:20,padding:18,color:PP.cream,position:'relative',overflow:'hidden',...style
    }}>
      <div style={{position:'absolute',top:-30,right:-30,width:100,height:100,borderRadius:'50%',background:T.highlight,opacity:.15}}/>
      <div style={{position:'relative'}}>
        <div style={{width:40,height:40,borderRadius:12,background:T.highlight,display:'grid',placeItems:'center',fontSize:18,marginBottom:10}}>{icon}</div>
        <Eyebrow color="rgba(255,255,255,.7)" style={{marginBottom:4}}>{label}</Eyebrow>
        <p style={{fontSize:26,fontWeight:900,letterSpacing:'-.6px',margin:0,fontVariantNumeric:'tabular-nums'}}>{amount}</p>
        {bank && <p style={{fontSize:10,color:T.highlight,fontWeight:600,marginTop:3}}>{bank}</p>}
      </div>
    </div>
  );
};

// 4-stage milestone progress (Created → Funded → Delivery → Done)
const MilestoneBar = ({ steps, activeIdx }) => {
  const T = getTheme();
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:6}}>
        {steps.map((step, i) => {
          const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending';
          return (
            <React.Fragment key={i}>
              <div style={{
                width:22,height:22,borderRadius:'50%',display:'grid',placeItems:'center',
                fontSize:10,fontWeight:800,
                background:state==='done'?T.highlight:state==='active'?T.accent:'rgba(255,255,255,.15)',
                color:state==='pending'?PP.stone:PP.ink
              }}>{state==='done'?'✓':i+1}</div>
              {i<steps.length-1 && <div style={{flex:1,height:3,background:i<activeIdx?T.highlight:'rgba(255,255,255,.15)'}}/>}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        {steps.map((s,i) => (
          <span key={i} style={{fontSize:9,fontWeight:700,color:i<activeIdx?T.highlight:i===activeIdx?T.accent:PP.stone}}>{s}</span>
        ))}
      </div>
    </div>
  );
};

// 3-segment verification bar (BVN | NIN | Face)
const VerifySegBar = ({ steps, activeIdx }) => {
  const T = getTheme();
  return (
    <div style={{display:'flex',gap:6}}>
      {steps.map((s, i) => {
        const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending';
        const color = state==='done'?T.highlight:state==='active'?T.accent:'rgba(255,255,255,.15)';
        return (
          <div key={i} style={{flex:1}}>
            <div style={{height:4,background:color,borderRadius:2,marginBottom:6}}/>
            <p style={{fontSize:10,fontWeight:700,letterSpacing:'.5px',margin:0,color:state==='pending'?PP.stone:color}}>{s}</p>
          </div>
        );
      })}
    </div>
  );
};

// Bottom nav
const BottomNav = ({ active, onChange }) => {
  const items = [
    {k:'home',icon:'⌂',label:'Home'},
    {k:'deals',icon:'📋',label:'Deals'},
    {k:'chat',icon:'💬',label:'Chat',badge:3},
    {k:'me',icon:'◉',label:'Me'}
  ];
  return (
    <div style={{
      position:'absolute',bottom:0,left:0,right:0,display:'flex',justifyContent:'space-around',
      background:'#fff',padding:'10px 0 14px',borderTop:`1px solid ${PP.sand}`
    }}>
      {items.map(it => (
        <div key={it.k} onClick={()=>onChange&&onChange(it.k)} style={{textAlign:'center',cursor:'pointer',position:'relative'}}>
          <div style={{fontSize:20,color:active===it.k?PP.emerald:PP.stone,marginBottom:2}}>{it.icon}</div>
          <span style={{fontSize:10,fontWeight:active===it.k?800:600,color:active===it.k?PP.emerald:PP.stone}}>{it.label}</span>
          {it.badge && <div style={{position:'absolute',top:-4,right:2,width:16,height:16,background:PP.coral,color:'#fff',borderRadius:'50%',fontSize:9,fontWeight:800,display:'grid',placeItems:'center'}}>{it.badge}</div>}
        </div>
      ))}
    </div>
  );
};

// Decorative lime dot grid (used on dark hero surfaces)
const DotGrid = ({ cols = 4, rows = 4, style }) => (
  <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:6,opacity:.2,...style}}>
    {Array.from({length: cols*rows}).map((_,i)=>(
      <div key={i} style={{width:4,height:4,borderRadius:'50%',background:PP.lime}}/>
    ))}
  </div>
);

Object.assign(window, {
  PP, PrimaryButton, DarkButton, EmeraldButton, TrustPill, TrinityBadge,
  Eyebrow, VaultCard, MilestoneBar, VerifySegBar, BottomNav, DotGrid
});
