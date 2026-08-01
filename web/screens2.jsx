// ============================================
// PAYPADDY WEB — SCREENS PART 2
// Create / DealRoom / Dispute (redesigned) / Agents / Merchant / USSD / Chat / Deals
// ============================================

// ───────── CREATE DEAL ─────────
const CreateDeal = ({ go }) => {
  const [picked, setPicked] = React.useState(null);
  const types = [
    {k:'buy',      icon:'🛍', label:'Buy / Sell',  desc:'Products & goods',    accent:PP.emerald, popular:true},
    {k:'service',  icon:'🔧', label:'Service',     desc:'Freelance work',       accent:PP.info},
    {k:'contract', icon:'📑', label:'Contract',    desc:'Milestone-based',      accent:PP.apricot},
    {k:'wager',    icon:'🎲', label:'Bet / Wager', desc:'Predictions',          accent:PP.caution},
  ];
  return (
    <div className="content">
      <button onClick={()=>go('home')} style={{color:PP.stone,fontSize:13,marginBottom:16}}>← Back to home</button>
      <div className="page-head">
        <div className="page-eye">New Deal</div>
        <div className="page-title">What would you like to do?</div>
        <div className="page-sub">Pick a deal type — we'll set up the right protection for you.</div>
      </div>

      <div className="card" style={{background:PP.ink,color:PP.cream,marginBottom:16,display:'flex',alignItems:'center',gap:14,padding:18,cursor:'pointer'}} onClick={()=>go('room')}>
        <div style={{width:44,height:44,borderRadius:12,background:PP.lime,display:'grid',placeItems:'center',fontSize:20}}>✨</div>
        <div style={{flex:1}}>
          <div className="eye" style={{color:PP.lime,marginBottom:2}}>SUGGESTED</div>
          <div style={{fontSize:14,fontWeight:700}}>Continue MacBook draft from yesterday?</div>
        </div>
        <span style={{color:PP.lime,fontSize:18}}>→</span>
      </div>

      <div className="eye" style={{marginBottom:12}}>Deal type</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:12,marginBottom:20}}>
        {types.map(t=>(
          <button key={t.k} onClick={()=>setPicked(t.k)} className="card" style={{textAlign:'left',padding:18,position:'relative',cursor:'pointer',border:picked===t.k?`2px solid ${PP.emerald}`:'2px solid transparent',transition:'all .15s'}}>
            {t.popular && <span style={{position:'absolute',top:10,right:10,background:PP.lime,color:PP.ink,padding:'2px 8px',borderRadius:999,fontSize:9,fontWeight:800}}>POPULAR</span>}
            <div style={{width:40,height:40,borderRadius:10,background:`${t.accent}20`,display:'grid',placeItems:'center',fontSize:20,marginBottom:12}}>{t.icon}</div>
            <div style={{fontSize:14,fontWeight:800,marginBottom:2}}>{t.label}</div>
            <div style={{fontSize:11,color:PP.stone}}>{t.desc}</div>
          </button>
        ))}
      </div>

      <button className="card" style={{background:PP.charcoal,color:PP.cream,display:'flex',alignItems:'center',gap:14,padding:18,width:'100%',textAlign:'left',marginBottom:20}} onClick={()=>setPicked('custom')}>
        <div style={{width:44,height:44,borderRadius:12,background:PP.lime,display:'grid',placeItems:'center',fontSize:20}}>🤝</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:800}}>Custom Deal</div>
          <div style={{fontSize:11,color:PP.stone}}>Define your own terms, any parties</div>
        </div>
        <span style={{color:PP.lime,fontSize:18}}>→</span>
      </button>

      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <button className="btn btn-ghost" onClick={()=>go('home')}>Cancel</button>
        <button className="btn btn-primary btn-lg" style={{flex:1,opacity:picked?1:.5,cursor:picked?'pointer':'not-allowed'}} disabled={!picked} onClick={()=>picked && go('room')}>
          {picked ? 'Continue →' : 'Select a deal type'}
        </button>
      </div>
    </div>
  );
};

// ───────── DEAL ROOM ─────────
const DealRoom = ({ go }) => (
  <div className="content">
    <button onClick={()=>go('home')} style={{color:PP.stone,fontSize:13,marginBottom:16}}>← Back</button>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20,gap:16,flexWrap:'wrap'}}>
      <div>
        <div className="eye" style={{fontFamily:'JetBrains Mono, monospace',marginBottom:6}}>#PP-4829</div>
        <div className="page-title">MacBook Pro Purchase</div>
        <div style={{fontSize:13,color:PP.stone,marginTop:4}}>with TechHub CV · funded Apr 15</div>
      </div>
      <span className="pill pill-apricot" style={{fontSize:12,padding:'6px 14px'}}>🚚 Shipping</span>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:16,marginBottom:20}}>
      <Vault amount="₦1,250,000" bank="with GTBank (CBN Licensed)"/>
      <div className="card">
        <div className="eye" style={{marginBottom:14}}>Milestones</div>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
          {['Created','Funded','Delivery','Done'].map((s,i)=>{
            const state = i<2?'done':i===2?'active':'pending';
            return (
              <React.Fragment key={i}>
                <div style={{width:28,height:28,borderRadius:'50%',display:'grid',placeItems:'center',fontSize:11,fontWeight:800,background:state==='done'?PP.emerald:state==='active'?PP.apricot:PP.sand,color:state==='pending'?PP.stone:'#fff'}}>{state==='done'?'✓':i+1}</div>
                {i<3 && <div style={{flex:1,height:3,background:i<2?PP.emerald:PP.sand}}/>}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:10,fontWeight:700}}>
          {['Created','Funded','Delivery','Done'].map((s,i)=><span key={i} style={{color:i<2?PP.emerald:i===2?PP.apricot:PP.stone}}>{s}</span>)}
        </div>
      </div>
    </div>

    <div className="card" style={{marginBottom:16}}>
      <div className="eye" style={{marginBottom:14}}>Activity</div>
      {[
        {t:'Apr 15 · 09:42', text:'✓ Funds verified and locked', tone:'emerald'},
        {t:'Apr 15 · 14:20', text:'💬 TechHub CV: "Shipped via DHL — tracking NGR38291"', tone:'neutral'},
        {t:'Apr 16 · 08:15', text:'📦 DHL pickup confirmed', tone:'neutral'},
        {t:'Apr 18 · est.',  text:'📦 Delivery expected', tone:'apricot'},
      ].map((e,i)=>(
        <div key={i} style={{display:'flex',gap:14,padding:'10px 0',borderBottom:i<3?`1px solid ${PP.sand}`:'none'}}>
          <div style={{fontSize:10,color:PP.stone,width:90,flexShrink:0,fontFamily:'JetBrains Mono, monospace'}}>{e.t}</div>
          <div style={{fontSize:13,flex:1,color:e.tone==='emerald'?PP.emerald:e.tone==='apricot'?'#B55A2E':PP.charcoal,fontWeight:e.tone==='neutral'?500:700}}>{e.text}</div>
        </div>
      ))}
    </div>

    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
      <button className="btn btn-primary btn-lg" style={{flex:'1 1 200px'}} onClick={()=>go('home')}>✓ I got the item — release funds</button>
      <button className="btn btn-ghost btn-lg" onClick={()=>go('chat')}>💬 Message seller</button>
      <button className="btn btn-ghost btn-lg" style={{color:PP.coral,borderColor:'rgba(255,107,74,.3)'}} onClick={()=>go('dispute')}>⚠ Raise dispute</button>
    </div>
  </div>
);

// ───────── DISPUTE (redesigned — calm, on-brand) ─────────
const Dispute = ({ go }) => {
  const [sel, setSel] = React.useState(null);
  const issues = [
    {icon:'📦', label:'Never arrived',       hint:'Item or service never delivered'},
    {icon:'❓', label:'Not as described',    hint:'Different from what was agreed'},
    {icon:'🧩', label:'Incomplete',          hint:'Only part of the order arrived'},
    {icon:'🔇', label:'Seller unresponsive', hint:'Radio silence for 48h+'},
    {icon:'✏️', label:'Something else',      hint:'Tell us in your own words'},
  ];
  return (
    <div className="content">
      <button onClick={()=>go('room')} style={{color:PP.stone,fontSize:13,marginBottom:16}}>← Back to deal</button>

      <div style={{background:`linear-gradient(135deg, ${PP.ink} 0%, ${PP.forest} 100%)`,borderRadius:20,padding:32,color:PP.cream,marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:PP.emerald,opacity:.2,filter:'blur(40px)'}}/>
        <div style={{position:'relative'}}>
          <div className="eye" style={{color:'rgba(255,255,255,.6)',marginBottom:10}}>DISPUTE — #PP-4829</div>
          <h2 style={{fontSize:'clamp(24px, 3.2vw, 34px)',fontWeight:900,letterSpacing:'-1px',lineHeight:1.15}}>
            Money no go waka.<br/><span style={{color:PP.lime}}>Your ₦1,250,000 is safe.</span>
          </h2>
          <div style={{display:'flex',gap:18,marginTop:18,flexWrap:'wrap'}}>
            {[{c:PP.emerald,t:'Funds frozen'},{c:PP.apricot,t:'24h avg. resolution'},{c:PP.lime,t:'Reviewed by a human'}].map((r,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'rgba(255,255,255,.85)'}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:r.c}}/>{r.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom:20,display:'flex',alignItems:'center',gap:12,padding:14}}>
        <div style={{width:40,height:40,borderRadius:10,background:'rgba(0,168,107,.1)',display:'grid',placeItems:'center',fontSize:18}}>📦</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800}}>MacBook Pro M3</div>
          <div style={{fontSize:11,color:PP.stone}}>with TechHub CV · funded Apr 15</div>
        </div>
        <div style={{fontSize:14,fontWeight:800}} className="tabular">₦1.25M</div>
      </div>

      <div className="eye" style={{marginBottom:12}}>What happened? · Step 1 of 3</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:8,marginBottom:20}}>
        {issues.map((t,i)=>{
          const active = sel===i;
          return (
            <button key={i} onClick={()=>setSel(i)} className="card" style={{padding:14,textAlign:'left',display:'flex',alignItems:'center',gap:12,background:active?PP.ink:'#fff',color:active?PP.cream:PP.charcoal,border:`2px solid ${active?PP.ink:'transparent'}`}}>
              <span style={{width:36,height:36,borderRadius:10,background:active?'rgba(191,255,79,.15)':'rgba(0,168,107,.08)',display:'grid',placeItems:'center',fontSize:18,flexShrink:0}}>{t.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:800}}>{t.label}</div>
                <div style={{fontSize:11,color:active?'rgba(250,247,242,.6)':PP.stone,marginTop:1}}>{t.hint}</div>
              </div>
              <span style={{width:20,height:20,borderRadius:'50%',border:`1.5px solid ${active?PP.lime:PP.sand}`,background:active?PP.lime:'transparent',display:'grid',placeItems:'center',fontSize:11,fontWeight:900,color:PP.ink,flexShrink:0}}>{active?'✓':''}</span>
            </button>
          );
        })}
      </div>

      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <button className="btn btn-ghost" onClick={()=>go('room')}>Cancel</button>
        <button className="btn btn-dark btn-lg" style={{flex:1,opacity:sel===null?.5:1}} disabled={sel===null} onClick={()=>go('room')}>
          {sel===null ? 'Select an issue to continue' : <>Open Dispute <span style={{color:PP.lime}}>→</span></>}
        </button>
      </div>
      <p style={{fontSize:11,color:PP.stone,textAlign:'center',marginTop:12}}>A real paddy (not a bot) reviews every case. Most resolve in under a day.</p>
    </div>
  );
};

// ───────── DEALS LIST ─────────
const Deals = ({ go }) => {
  const [tab, setTab] = React.useState('active');
  const tabs = [{k:'active',l:'Active',c:4},{k:'pending',l:'Pending',c:2},{k:'done',l:'Completed',c:47},{k:'disputes',l:'Disputes',c:0}];
  const rows = [
    {icon:'📦',title:'MacBook Pro M3',meta:'TechHub CV · Shipping',amt:'₦1.25M',pill:'Shipping',pc:'pill-apricot'},
    {icon:'🏠',title:'Apartment Deposit',meta:'LagosHomes · Funded',amt:'₦800K',pill:'Funded',pc:'pill-emerald'},
    {icon:'🎲',title:'Super Eagles Bet',meta:'@ChuksD · Match in 4h',amt:'₦400K',pill:'Live',pc:'pill-info'},
    {icon:'🔧',title:'Logo Design',meta:'Pixel Studios · Milestone 2/3',amt:'₦250K',pill:'In progress',pc:'pill-apricot'},
  ];
  return (
    <div className="content">
      <div className="page-head"><div className="page-eye">Portfolio</div><div className="page-title">My Deals</div></div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {tabs.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} className="btn" style={{padding:'8px 16px',fontSize:12,background:tab===t.k?PP.ink:'transparent',color:tab===t.k?PP.cream:PP.charcoal,border:`1.5px solid ${tab===t.k?PP.ink:'#E6DFD2'}`}}>
            {t.l} <span style={{opacity:.6,marginLeft:4}}>{t.c}</span>
          </button>
        ))}
      </div>
      <div style={{display:'grid',gap:10}}>
        {rows.map((d,i)=>(
          <button key={i} onClick={()=>go('room')} className="card" style={{display:'flex',alignItems:'center',gap:14,padding:16,textAlign:'left'}}>
            <div style={{width:44,height:44,borderRadius:12,background:'rgba(0,168,107,.08)',display:'grid',placeItems:'center',fontSize:20,flexShrink:0}}>{d.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:800}}>{d.title}</div>
              <div style={{fontSize:11,color:PP.stone,marginTop:2}}>{d.meta}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:14,fontWeight:800}} className="tabular">{d.amt}</div>
              <span className={'pill ' + d.pc} style={{marginTop:4}}>{d.pill}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ───────── CHAT ─────────
const Chat = ({ go }) => (
  <div className="content">
    <div className="page-head"><div className="page-eye">Messages</div><div className="page-title">Chat</div></div>
    <div style={{display:'grid',gap:10}}>
      {[
        {n:'TechHub CV',m:'Shipped via DHL — tracking NGR38291',t:'2h',u:2,deal:'MacBook'},
        {n:'LagosHomes',m:'Thanks — all set for the viewing',t:'1d',u:0,deal:'Apartment'},
        {n:'@ChuksD',m:'Let\'s see who\'s right 😎',t:'3d',u:1,deal:'Super Eagles'},
      ].map((c,i)=>(
        <button key={i} onClick={()=>go('room')} className="card" style={{display:'flex',alignItems:'center',gap:14,padding:16,textAlign:'left'}}>
          <div style={{width:40,height:40,borderRadius:'50%',background:PP.forest,color:PP.cream,display:'grid',placeItems:'center',fontSize:13,fontWeight:800,flexShrink:0}}>{c.n[0]}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:2}}>
              <div style={{fontSize:14,fontWeight:800}}>{c.n}</div>
              <div style={{fontSize:11,color:PP.stone}}>{c.t}</div>
            </div>
            <div style={{fontSize:12,color:PP.stone,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.m}</div>
            <div style={{fontSize:10,color:PP.emerald,fontWeight:700,marginTop:2}}>re: {c.deal}</div>
          </div>
          {c.u>0 && <div style={{width:20,height:20,borderRadius:'50%',background:PP.coral,color:'#fff',fontSize:10,fontWeight:800,display:'grid',placeItems:'center'}}>{c.u}</div>}
        </button>
      ))}
    </div>
  </div>
);

// ───────── AGENTS ─────────
const Agents = ({ go }) => (
  <div className="content">
    <button onClick={()=>go('home')} style={{color:PP.stone,fontSize:13,marginBottom:16}}>← Back</button>
    <div className="page-head"><div className="page-eye">Offline access</div><div className="page-title">Agents near you</div><div className="page-sub">Deposit cash, withdraw to PayPaddy, or get help in person.</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:12}}>
      {[
        {n:'Mama Chika Kiosk',d:'280m',r:'4.9★',a:'Computer Village',h:'Open · closes 8pm'},
        {n:'QuickCash Ikeja',d:'650m',r:'4.8★',a:'Allen Ave',h:'Open · 24/7'},
        {n:'PayPoint Yaba',d:'1.2km',r:'4.7★',a:'Herbert Macaulay',h:'Open · closes 9pm'},
        {n:'Mobile Money Hub',d:'2.4km',r:'4.6★',a:'Surulere',h:'Open · closes 10pm'},
      ].map((a,i)=>(
        <div key={i} className="card" style={{padding:16}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:40,height:40,borderRadius:10,background:'rgba(0,168,107,.1)',display:'grid',placeItems:'center',fontSize:18}}>📍</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:800}}>{a.n}</div>
              <div style={{fontSize:11,color:PP.stone}}>{a.a} · {a.r}</div>
            </div>
            <div style={{fontSize:12,fontWeight:800,color:PP.stone}} className="tabular">{a.d}</div>
          </div>
          <div style={{fontSize:11,color:PP.emerald,fontWeight:700,marginBottom:10}}>● {a.h}</div>
          <button className="btn btn-ghost" style={{width:'100%',padding:'8px 12px',fontSize:12}}>Get directions →</button>
        </div>
      ))}
    </div>
  </div>
);

// ───────── USSD ─────────
const USSD = ({ go }) => (
  <div className="content" style={{maxWidth:600}}>
    <button onClick={()=>go('home')} style={{color:PP.stone,fontSize:13,marginBottom:16}}>← Back</button>
    <div className="page-head"><div className="page-eye">Offline</div><div className="page-title">Pay without data</div><div className="page-sub">No data? No wahala. Dial the code on any phone.</div></div>
    <div className="card" style={{background:PP.ink,padding:32,textAlign:'center',marginBottom:20}}>
      <div className="eye" style={{color:PP.stone,marginBottom:10}}>DIAL THIS CODE</div>
      <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:'clamp(28px, 5vw, 44px)',fontWeight:800,color:PP.lime,letterSpacing:3,marginBottom:10}}>*999*1*4829#</div>
      <div style={{fontSize:12,color:PP.stone}}>Expires in <span style={{color:PP.coral,fontWeight:800}}>04:52</span></div>
    </div>
    <div className="card">
      {[{n:1,t:<><strong>Dial the code</strong> on your phone — no internet needed</>},{n:2,t:<><strong>Enter your PIN</strong> when prompted by your bank</>},{n:3,t:<><strong>Get SMS confirmation</strong> — deal funded instantly</>}].map(s=>(
        <div key={s.n} style={{display:'flex',gap:14,padding:'12px 0',borderBottom:s.n<3?`1px solid ${PP.sand}`:'none'}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:PP.emerald,color:'#fff',display:'grid',placeItems:'center',fontSize:12,fontWeight:800,flexShrink:0}}>{s.n}</div>
          <div style={{fontSize:13,lineHeight:1.55}}>{s.t}</div>
        </div>
      ))}
    </div>
  </div>
);

// ───────── MERCHANT ─────────
const Merchant = ({ go }) => (
  <div className="content">
    <div className="page-head">
      <div className="page-eye">Merchant Dashboard</div>
      <div className="page-title">TechHub CV <span style={{fontSize:14,color:PP.emerald,fontWeight:700,marginLeft:8}}>✓ Verified</span></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:12,marginBottom:24}}>
      {[{l:'Today',v:'₦3.4M',c:PP.charcoal},{l:'In escrow',v:'₦8.9M',c:PP.emerald},{l:'Disputes',v:'0',c:PP.emerald},{l:'Trust score',v:'4.9 ★',c:PP.caution}].map((s,i)=>(
        <div key={i} className="card">
          <div className="eye" style={{marginBottom:8}}>{s.l}</div>
          <div style={{fontSize:24,fontWeight:900,color:s.c,letterSpacing:'-.6px'}} className="tabular">{s.v}</div>
        </div>
      ))}
    </div>
    <div className="eye" style={{marginBottom:12}}>Pending release · 3</div>
    <div style={{display:'grid',gap:10,marginBottom:24}}>
      {[{b:'Ade O.',it:'MacBook Pro M3',amt:'₦1.25M',state:'Delivered — awaiting confirm',pct:75,c:PP.apricot},{b:'Ngozi K.',it:'iPhone 15 Pro',amt:'₦950K',state:'Funded — ship today',pct:40,c:PP.info},{b:'Tunde A.',it:'Gaming PC build',amt:'₦2.1M',state:'Milestone 2/3',pct:60,c:PP.emerald}].map((r,i)=>(
        <div key={i} className="card" style={{padding:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:8,gap:12,flexWrap:'wrap'}}>
            <div><div style={{fontSize:14,fontWeight:800}}>{r.it}</div><div style={{fontSize:11,color:PP.stone,marginTop:2}}>{r.b}</div></div>
            <div style={{fontSize:16,fontWeight:800}} className="tabular">{r.amt}</div>
          </div>
          <div style={{height:5,background:PP.sand,borderRadius:3,overflow:'hidden',marginBottom:6}}>
            <div style={{height:'100%',width:`${r.pct}%`,background:r.c,borderRadius:3}}/>
          </div>
          <div style={{fontSize:11,color:PP.stone,fontWeight:600}}>{r.state}</div>
        </div>
      ))}
    </div>
    <div className="card" style={{display:'flex',alignItems:'center',gap:14,padding:18}}>
      <div style={{width:44,height:44,borderRadius:12,background:`${PP.emerald}20`,display:'grid',placeItems:'center',fontSize:20}}>💸</div>
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:800}}>Next payout — Friday</div>
        <div style={{fontSize:11,color:PP.stone,marginTop:2}}>To GTBank ····4829 · T+1 settlement</div>
      </div>
      <div style={{fontSize:18,fontWeight:900,color:PP.emerald}} className="tabular">₦2.2M</div>
    </div>
  </div>
);

// ───────── ME / PROFILE ─────────
const Me = ({ go }) => (
  <div className="content">
    <div className="page-head"><div className="page-eye">Account</div><div className="page-title">Me</div></div>
    <div className="card" style={{display:'flex',alignItems:'center',gap:16,padding:24,marginBottom:16}}>
      <div style={{width:64,height:64,borderRadius:'50%',background:PP.apricot,color:PP.ink,display:'grid',placeItems:'center',fontSize:22,fontWeight:800}}>AO</div>
      <div style={{flex:1}}>
        <div style={{fontSize:18,fontWeight:900}}>Ade Adeyemi</div>
        <div style={{fontSize:12,color:PP.stone,marginTop:2}}>ade.a@gmail.com · +234 ···· 4829</div>
        <span className="pill pill-emerald" style={{marginTop:8}}>✓ Trinity verified</span>
      </div>
    </div>
    {[{ic:'🏦',l:'Linked accounts',s:'GTBank ····4829'},{ic:'🔔',l:'Notifications',s:'Email, SMS, Push'},{ic:'🛡️',l:'Security',s:'PIN, 2FA enabled'},{ic:'❓',l:'Help & support',s:'24/7 human paddys'}].map((r,i)=>(
      <button key={i} className="card" style={{display:'flex',alignItems:'center',gap:14,padding:16,width:'100%',textAlign:'left',marginBottom:8}}>
        <div style={{width:40,height:40,borderRadius:10,background:'rgba(10,31,26,.05)',display:'grid',placeItems:'center',fontSize:18}}>{r.ic}</div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:800}}>{r.l}</div><div style={{fontSize:11,color:PP.stone,marginTop:2}}>{r.s}</div></div>
        <span style={{color:PP.stone,fontSize:16}}>→</span>
      </button>
    ))}
  </div>
);

Object.assign(window, { CreateDeal, DealRoom, Dispute, Deals, Chat, Agents, USSD, Merchant, Me });
