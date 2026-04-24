// Shared tokens + shell components for the web app

const PP = {
  ink: '#0A1F1A', forest: '#14453D', emerald: '#00A86B', lime: '#BFFF4F',
  apricot: '#FF9D6E', coral: '#FF6B4A', cream: '#FAF7F2', sand: '#F0EBE1',
  warmBg: '#F5F1EA', stone: '#8B8680', charcoal: '#1C1C1C',
  caution: '#F5A623', alert: '#E94B3C', info: '#3D7FFF'
};

// Persistent left sidebar (desktop)
const Sidebar = ({ route, go, unread }) => {
  const primary = [
    {k:'home',     ic:'⌂', label:'Home'},
    {k:'deals',    ic:'📋', label:'My Deals'},
    {k:'create',   ic:'＋', label:'Start a Deal'},
    {k:'chat',     ic:'💬', label:'Messages', badge: unread},
    {k:'agents',   ic:'📍', label:'Find an Agent'},
  ];
  const secondary = [
    {k:'merchant', ic:'🏪', label:'Merchant'},
    {k:'ussd',     ic:'📱', label:'Pay Offline'},
    {k:'trinity',  ic:'🛡', label:'Verification'},
  ];
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">🔒</div>
        <div className="logo-text">PayPaddy</div>
      </div>
      <div className="nav-section">Main</div>
      {primary.map(it => (
        <button key={it.k} className={'nav-item' + (route===it.k?' active':'')} onClick={()=>go(it.k)}>
          <span className="ic">{it.ic}</span>{it.label}
          {it.badge ? <span className="badge">{it.badge}</span> : null}
        </button>
      ))}
      <div className="nav-section">More</div>
      {secondary.map(it => (
        <button key={it.k} className={'nav-item' + (route===it.k?' active':'')} onClick={()=>go(it.k)}>
          <span className="ic">{it.ic}</span>{it.label}
        </button>
      ))}
      <div className="sidebar-foot">
        <div className="avatar">AO</div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:PP.cream}}>Ade Adeyemi</div>
          <div style={{fontSize:10,color:PP.stone}}>Trinity ✓ verified</div>
        </div>
      </div>
    </aside>
  );
};

// Mobile bottom nav
const MobileNav = ({ route, go, unread }) => {
  const items = [
    {k:'home', ic:'⌂', label:'Home'},
    {k:'deals', ic:'📋', label:'Deals'},
    {k:'create', ic:'＋', label:'New'},
    {k:'chat', ic:'💬', label:'Chat', badge: unread},
    {k:'me', ic:'◉', label:'Me'},
  ];
  return (
    <nav className="mobile-nav">
      {items.map(it => (
        <button key={it.k} className={route===it.k?'active':''} onClick={()=>go(it.k)}>
          <span className="ic">{it.ic}</span>
          <span>{it.label}</span>
          {it.badge ? <span className="badge">{it.badge}</span> : null}
        </button>
      ))}
    </nav>
  );
};

// Mobile top bar — shown on home only
const MobileTopbar = ({ onNotif }) => (
  <div className="mobile-topbar">
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:30,height:30,background:PP.lime,borderRadius:8,transform:'rotate(-8deg)',display:'grid',placeItems:'center',fontSize:14}}>🔒</div>
      <div style={{fontWeight:900,letterSpacing:'-.3px'}}>PayPaddy</div>
    </div>
    <button onClick={onNotif} style={{position:'relative',fontSize:18}}>
      🔔<span style={{position:'absolute',top:-2,right:-2,width:7,height:7,background:PP.coral,borderRadius:'50%'}}/>
    </button>
  </div>
);

// Reusable vault card
const Vault = ({ amount, bank, label='LOCKED IN ESCROW', style }) => (
  <div style={{
    background:`linear-gradient(135deg, ${PP.ink} 0%, ${PP.forest} 100%)`,
    borderRadius:20,padding:24,color:PP.cream,position:'relative',overflow:'hidden',...style
  }}>
    <div style={{position:'absolute',top:-40,right:-40,width:140,height:140,borderRadius:'50%',background:PP.emerald,opacity:.2,filter:'blur(10px)'}}/>
    <div style={{position:'absolute',bottom:-50,right:40,width:80,height:80,borderRadius:'50%',background:PP.lime,opacity:.1,filter:'blur(10px)'}}/>
    <div style={{position:'relative'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <div style={{width:44,height:44,borderRadius:12,background:PP.emerald,display:'grid',placeItems:'center',fontSize:20}}>🔒</div>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:'.8px',color:'rgba(255,255,255,.7)'}}>{label}</div>
      </div>
      <div style={{fontSize:34,fontWeight:900,letterSpacing:'-1px'}} className="tabular">{amount}</div>
      {bank && <div style={{fontSize:11,color:PP.lime,fontWeight:600,marginTop:4}}>{bank}</div>}
    </div>
  </div>
);

// Trust badges row
const TrustRow = () => (
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    {['CBN Licensed','NDIC Insured','NDPR Compliant'].map(t=>(
      <span key={t} style={{padding:'5px 11px',background:'rgba(10,31,26,.05)',borderRadius:999,fontSize:10,fontWeight:700,color:PP.forest,border:'1px solid rgba(10,31,26,.08)'}}>✓ {t}</span>
    ))}
  </div>
);

Object.assign(window, { PP, Sidebar, MobileNav, MobileTopbar, Vault, TrustRow });
