const CreateDeal = ({ onBack, onPick }) => (
  <div style={{height:'100%',background:PP.cream,color:PP.charcoal,padding:16,overflow:'auto'}}>
    <div style={{display:'flex',alignItems:'center',gap:10,marginTop:24,marginBottom:4}}>
      <span onClick={onBack} style={{fontSize:18,cursor:'pointer'}}>←</span>
      <h3 style={{fontSize:20,fontWeight:900,letterSpacing:'-.5px'}}>Start a Deal</h3>
    </div>
    <p style={{fontSize:12,color:PP.stone,marginBottom:16,marginLeft:28}}>What would you like to do?</p>
    <div style={{background:PP.ink,color:PP.cream,borderRadius:14,padding:14,marginBottom:14,display:'flex',gap:12,alignItems:'center'}}>
      <div style={{width:36,height:36,borderRadius:10,background:PP.lime,display:'grid',placeItems:'center',fontSize:18}}>✨</div>
      <div style={{flex:1}}>
        <Eyebrow color={PP.lime}>SUGGESTED</Eyebrow>
        <p style={{fontSize:13,fontWeight:600,marginTop:2}}>Continue MacBook deal draft?</p>
      </div>
      <span style={{color:PP.lime,fontSize:18}}>→</span>
    </div>
    <Eyebrow style={{marginBottom:10}}>Choose Deal Type</Eyebrow>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
      {[
        {icon:'🛍',label:'Buy / Sell',desc:'Products & goods',accent:PP.emerald,popular:true},
        {icon:'🔧',label:'Service',desc:'Freelance work',accent:PP.info},
        {icon:'📑',label:'Contract',desc:'Milestones',accent:PP.apricot},
        {icon:'🎲',label:'Bet / Wager',desc:'Predictions',accent:PP.caution},
      ].map((t,i)=>(
        <div key={i} onClick={()=>onPick&&onPick(t.label)} style={{background:'#fff',borderRadius:12,padding:14,border:`1.5px solid ${PP.sand}`,position:'relative',cursor:'pointer',minHeight:108}}>
          {t.popular && <span style={{position:'absolute',top:6,right:6,fontSize:8,background:PP.lime,color:PP.ink,padding:'2px 6px',borderRadius:999,fontWeight:800}}>POPULAR</span>}
          <div style={{width:36,height:36,borderRadius:10,background:`${t.accent}20`,display:'grid',placeItems:'center',fontSize:18,marginBottom:8}}>{t.icon}</div>
          <div style={{fontSize:13,fontWeight:800,marginBottom:2}}>{t.label}</div>
          <div style={{fontSize:10,color:PP.stone}}>{t.desc}</div>
        </div>
      ))}
    </div>
    <div style={{background:PP.charcoal,color:PP.cream,borderRadius:14,padding:14,marginBottom:12,display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
      <div style={{width:40,height:40,borderRadius:10,background:PP.lime,display:'grid',placeItems:'center',fontSize:18}}>🤝</div>
      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:800}}>Custom Deal</div><div style={{fontSize:10,color:PP.stone}}>Define your own — any parties, any terms</div></div>
      <span style={{color:PP.lime,fontSize:16}}>→</span>
    </div>
    <div style={{background:'rgba(0,168,107,.08)',border:'1px solid rgba(0,168,107,.2)',borderRadius:8,padding:'10px 12px',fontSize:11,color:PP.forest,lineHeight:1.5}}>
      🔒 All deals are escrow-protected with a CBN-licensed bank partner.
    </div>
  </div>
);
window.CreateDeal = CreateDeal;
