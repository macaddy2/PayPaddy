// ============================================
// PAYPADDY WEB — SCREENS
// All screens use real workflow wiring: buttons call go() with the next route
// ============================================

// ───────── SPLASH (pre-auth) ─────────
const Splash = ({ go }) => (
  <div className="splash-takeover">
    <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:PP.emerald,filter:'blur(120px)',opacity:.35,top:-80,left:-100}}/>
    <div style={{position:'absolute',width:300,height:300,borderRadius:'50%',background:PP.lime,filter:'blur(120px)',opacity:.15,bottom:-60,right:-80}}/>
    <div style={{position:'absolute',width:200,height:200,borderRadius:'50%',background:PP.apricot,filter:'blur(100px)',opacity:.18,bottom:120,left:'20%'}}/>
    <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:'48px 24px',textAlign:'center',maxWidth:720,margin:'0 auto'}}>
      <div style={{width:64,height:64,background:PP.lime,borderRadius:16,display:'grid',placeItems:'center',transform:'rotate(-8deg)',fontSize:30,marginBottom:32}}>🔒</div>
      <h1 style={{fontSize:'clamp(40px, 7vw, 72px)',fontWeight:900,lineHeight:1.02,letterSpacing:'-2px',color:PP.cream,marginBottom:20}}>
        No wahala.<br/><span style={{color:PP.lime}}>Your money</span> is safe.
      </h1>
      <p style={{fontSize:'clamp(13px, 1.6vw, 17px)',color:'rgba(250,247,242,.7)',lineHeight:1.5,maxWidth:480,marginBottom:32}}>
        The trust layer for any deal — commerce, contracts, wagers, services. Funds stay locked with a CBN-licensed bank until both sides agree.
      </p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginBottom:32}}>
        {['CBN Licensed','NDIC Insured','NDPR'].map(t=>(
          <span key={t} style={{padding:'6px 12px',background:'rgba(255,255,255,.08)',borderRadius:999,fontSize:11,fontWeight:700,color:PP.cream,border:'1px solid rgba(255,255,255,.1)'}}>✓ {t}</span>
        ))}
      </div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center'}}>
        <button className="btn btn-lg" style={{background:PP.lime,color:PP.ink}} onClick={()=>go('onboarding')}>Create Account →</button>
        <button className="btn btn-lg" style={{background:'transparent',color:PP.cream,border:'1.5px solid rgba(255,255,255,.2)'}} onClick={()=>go('home')}>Sign in</button>
      </div>
    </div>
  </div>
);

// ───────── ONBOARDING (3-step) ─────────
const Onboarding = ({ go }) => {
  const [step, setStep] = React.useState(0);
  const slides = [
    {icon:'🔒', title:'Lock your money', body:'Funds sit with a CBN-licensed bank until both parties agree.'},
    {icon:'🤝', title:'Any deal, any paddy', body:'Goods, services, contracts, wagers — one trust layer for all.'},
    {icon:'🛡️', title:'Real humans resolve', body:'If something goes wrong, a human mediator steps in within 24h.'},
  ];
  const s = slides[step];
  return (
    <div className="splash-takeover">
      <div style={{position:'absolute',width:300,height:300,borderRadius:'50%',background:PP.apricot,filter:'blur(120px)',opacity:.18,top:'20%',right:-60}}/>
      <div style={{position:'relative',zIndex:2,flex:1,display:'flex',flexDirection:'column',padding:'32px 24px',maxWidth:600,margin:'0 auto',width:'100%'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:6}}>{slides.map((_,i)=>(<div key={i} style={{width:i===step?28:8,height:6,borderRadius:3,background:i===step?PP.lime:'rgba(255,255,255,.2)',transition:'all .3s'}}/>))}</div>
          <button style={{color:PP.stone,fontSize:13}} onClick={()=>go('trinity')}>Skip →</button>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div style={{width:88,height:88,background:PP.lime,borderRadius:22,display:'grid',placeItems:'center',fontSize:40,marginBottom:32,transform:'rotate(-6deg)'}}>{s.icon}</div>
          <h2 style={{fontSize:'clamp(32px, 5vw, 48px)',fontWeight:900,letterSpacing:'-1.4px',lineHeight:1.1,marginBottom:14,color:PP.cream}}>{s.title}</h2>
          <p style={{fontSize:'clamp(14px, 1.8vw, 18px)',color:'rgba(250,247,242,.65)',lineHeight:1.55,maxWidth:420}}>{s.body}</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          {step>0 && <button className="btn btn-lg" style={{background:'rgba(255,255,255,.06)',color:PP.cream,flex:'0 0 auto'}} onClick={()=>setStep(step-1)}>← Back</button>}
          <button className="btn btn-lg btn-block" style={{background:PP.lime,color:PP.ink,flex:1}} onClick={()=> step<2 ? setStep(step+1) : go('trinity')}>{step<2?'Next →':'Start verification →'}</button>
        </div>
      </div>
    </div>
  );
};

// ───────── TRINITY (verification) ─────────
const Trinity = ({ go }) => {
  const [filled, setFilled] = React.useState(5);
  const complete = filled === 11;
  return (
    <div style={{minHeight:'100%',background:PP.ink,color:PP.cream}}>
      <div style={{maxWidth:640,margin:'0 auto',padding:'clamp(32px, 5vw, 64px) 20px'}}>
        <button onClick={()=>go('home')} style={{color:PP.stone,fontSize:13,marginBottom:24}}>← Skip for now</button>
        <div style={{fontSize:11,color:PP.stone,marginBottom:8,fontWeight:700,letterSpacing:'.5px'}}>STEP 2 OF 3 · TRINITY VERIFICATION</div>
        <h1 style={{fontSize:'clamp(28px, 4vw, 44px)',fontWeight:900,letterSpacing:'-1.2px',lineHeight:1.1,marginBottom:10}}>One quick check left</h1>
        <p style={{fontSize:14,color:PP.stone,marginBottom:28}}>Add your NIN and we're done.</p>

        {/* progress segments */}
        <div style={{display:'flex',gap:8,marginBottom:32}}>
          {[
            {l:'BVN',state:'done'},{l:'NIN',state:'active'},{l:'FACE',state:'pending'}
          ].map((s,i)=>(
            <div key={i} style={{flex:1}}>
              <div style={{height:5,borderRadius:3,marginBottom:8,background:s.state==='done'?PP.lime:s.state==='active'?PP.apricot:'rgba(255,255,255,.15)'}}/>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:'.5px',color:s.state==='done'?PP.lime:s.state==='active'?PP.apricot:PP.stone}}>{s.l} {s.state==='done'?'✓':''}</div>
            </div>
          ))}
        </div>

        <div style={{background:'rgba(255,255,255,.04)',border:`1.5px solid ${PP.apricot}`,borderRadius:16,padding:24,marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:'.8px',color:PP.apricot,marginBottom:16}}>ENTER YOUR NIN</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {Array.from({length:11}).map((_,i)=>{
              const isFilled = i < filled;
              const isCursor = i === filled;
              return (
                <div key={i} onClick={()=>setFilled(Math.min(11, i+1))} style={{
                  width:'calc((100% - 60px) / 11)',minWidth:26,aspectRatio:'3/4',borderRadius:6,
                  background:isFilled?PP.cream:'rgba(255,255,255,.06)',
                  border:isCursor?`1.5px solid ${PP.apricot}`:'1px solid rgba(255,255,255,.12)',
                  display:'grid',placeItems:'center',fontSize:18,fontWeight:800,color:isFilled?PP.ink:'transparent',
                  cursor:'pointer',transition:'all .15s'
                }}>•</div>
              );
            })}
          </div>
          <p style={{fontSize:10,color:PP.stone,marginTop:14,textAlign:'center'}}>🔒 Encrypted & stored with NDPR-compliant partner · click a cell to simulate typing</p>
        </div>

        <div style={{display:'flex',gap:10,padding:16,background:'rgba(255,255,255,.03)',borderRadius:12,marginBottom:32}}>
          <span style={{fontSize:20}}>🛡️</span>
          <div>
            <div style={{fontSize:13,fontWeight:800,marginBottom:2}}>Why three checks?</div>
            <p style={{fontSize:12,color:PP.stone,lineHeight:1.55}}>BVN confirms your bank. NIN confirms your identity. Face match ties it together — all for your safety.</p>
          </div>
        </div>

        <button className="btn btn-lg btn-block" style={{background:complete?PP.lime:'rgba(255,255,255,.1)',color:complete?PP.ink:PP.stone,cursor:complete?'pointer':'not-allowed'}} onClick={()=>complete && go('home')}>
          {complete ? 'Verify NIN →' : 'Enter all 11 digits'}
        </button>
      </div>
    </div>
  );
};

// ───────── HOME / DASHBOARD ─────────
const Home = ({ go }) => {
  const deals = [
    {id:1, icon:'📦', title:'MacBook Pro M3', meta:'TechHub CV · Awaiting delivery', amt:'₦1,250,000', pill:'Shipping', pillClass:'pill-apricot', urgent:true},
    {id:2, icon:'🏠', title:'Apartment Deposit', meta:'LagosHomes · Funded', amt:'₦800,000', pill:'Funded', pillClass:'pill-emerald'},
    {id:3, icon:'🎲', title:'Super Eagles vs Ghana', meta:'@ChuksD · Match in 4h', amt:'₦400,000', pill:'Live', pillClass:'pill-info'},
  ];
  return (
    <div className="content">
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:16}}>
        <div>
          <div className="page-eye">Welcome back</div>
          <div className="page-title">Good afternoon, Ade 👋</div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={()=>go('create')}>＋ Start a New Deal</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:16,marginBottom:28}}>
        <Vault amount="₦2,450,000" bank="across 4 active deals" label="TOTAL IN ESCROW" style={{gridColumn:'span 1'}}/>
        <div className="card">
          <div className="eye" style={{marginBottom:10}}>Released this month</div>
          <div style={{fontSize:26,fontWeight:900,letterSpacing:'-.8px'}} className="tabular">₦4.2M</div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:8,fontSize:11,color:PP.emerald,fontWeight:700}}>↑ 18% from last month</div>
          <div style={{display:'flex',gap:2,marginTop:14,alignItems:'flex-end',height:40}}>
            {[12,18,14,22,16,28,24,32,26,38,30,42].map((h,i)=>(
              <div key={i} style={{flex:1,height:`${h}px`,background:i<8?'rgba(0,168,107,.3)':PP.emerald,borderRadius:'2px 2px 0 0'}}/>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="eye" style={{marginBottom:10}}>Trust score</div>
          <div style={{display:'flex',alignItems:'baseline',gap:6}}>
            <div style={{fontSize:26,fontWeight:900,letterSpacing:'-.8px'}}>4.9</div>
            <div style={{color:PP.stone,fontSize:12}}>/ 5.0</div>
          </div>
          <div style={{display:'flex',gap:2,marginTop:8}}>
            {[1,1,1,1,1].map((_,i)=>(<span key={i} style={{color:PP.caution,fontSize:16}}>★</span>))}
          </div>
          <div style={{fontSize:11,color:PP.stone,marginTop:10}}>47 deals completed · 0 disputes</div>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div className="eye">Active Deals · {deals.length}</div>
        <button style={{fontSize:12,color:PP.emerald,fontWeight:700}} onClick={()=>go('deals')}>View all →</button>
      </div>
      <div style={{display:'grid',gap:10}}>
        {deals.map(d=>(
          <button key={d.id} onClick={()=>go('room')} className="card" style={{display:'flex',alignItems:'center',gap:14,padding:16,textAlign:'left',cursor:'pointer',borderLeft:d.urgent?`3px solid ${PP.coral}`:'3px solid transparent',transition:'all .15s'}}
            onMouseOver={e=>e.currentTarget.style.transform='translateX(2px)'}
            onMouseOut={e=>e.currentTarget.style.transform='translateX(0)'}>
            <div style={{width:44,height:44,borderRadius:12,background:'rgba(0,168,107,.08)',display:'grid',placeItems:'center',fontSize:20,flexShrink:0}}>{d.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:800}}>{d.title}</div>
              <div style={{fontSize:11,color:PP.stone,marginTop:2}}>{d.meta}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:14,fontWeight:800}} className="tabular">{d.amt}</div>
              <span className={'pill ' + d.pillClass} style={{marginTop:4}}>{d.pill}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { Splash, Onboarding, Trinity, Home });
