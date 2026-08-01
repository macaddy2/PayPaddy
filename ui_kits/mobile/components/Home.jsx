const Home = ({ onNewDeal, onOpenDeal }) => {
  const T = getTheme();
  return (
  <div style={{height:'100%',background:PP.cream,color:PP.charcoal,overflow:'hidden',display:'flex',flexDirection:'column'}}>
    <div style={{background:T.headerGrad,borderRadius:'0 0 24px 24px',padding:'38px 16px 16px',color:PP.cream,position:'relative',overflow:'hidden'}}>
      <DotGrid cols={3} rows={3} style={{position:'absolute',top:20,right:20,opacity:.15}}/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:PP.apricot,display:'grid',placeItems:'center',fontSize:13,fontWeight:800,color:PP.ink}}>AO</div>
          <div style={{fontSize:14,fontWeight:700}}>Welcome back, Ade 👋</div>
        </div>
        <div style={{position:'relative',fontSize:18}}>🔔<span style={{position:'absolute',top:-2,right:-2,width:7,height:7,background:PP.coral,borderRadius:'50%'}}/></div>
      </div>
      <VaultCard amount="₦2,450,000" label="LOCKED IN ESCROW" bank="across 4 active deals"/>
    </div>
    <div style={{padding:'14px 16px 80px',flex:1,overflow:'auto'}}>
      <DarkButton onClick={onNewDeal} style={{marginBottom:12}}>
        <span style={{width:22,height:22,background:PP.lime,borderRadius:6,color:PP.ink,display:'grid',placeItems:'center',fontWeight:800,fontSize:14}}>+</span>
        Start a New Deal
      </DarkButton>
      <div style={{display:'flex',gap:6,marginBottom:16}}>
        {['Join Deal','Quick Pay','My Paddys'].map(l=>(
          <div key={l} style={{flex:1,padding:'10px 6px',borderRadius:8,border:`1px solid ${PP.sand}`,textAlign:'center',fontSize:11,fontWeight:700,background:'#fff',color:PP.charcoal}}>{l}</div>
        ))}
      </div>
      <Eyebrow style={{marginBottom:8}}>Active Deals · 3</Eyebrow>
      {[
        {icon:'📦',title:'MacBook Pro M3',meta:'TechHub CV · Awaiting delivery',amt:'₦1.25M',urgent:true,bg:'rgba(255,107,74,.1)'},
        {icon:'🏠',title:'Apartment Deposit',meta:'LagosHomes · Funded',amt:'₦800K',bg:'rgba(0,168,107,.1)'},
        {icon:'🎲',title:'Super Eagles Bet',meta:'@ChuksD · Match day',amt:'₦400K',bg:'rgba(191,255,79,.12)'}
      ].map((d,i)=>(
        <div key={i} onClick={()=>onOpenDeal&&onOpenDeal()} style={{background:'#fff',borderRadius:8,padding:12,marginBottom:8,display:'flex',alignItems:'center',gap:10,borderLeft:`3px solid ${d.urgent?PP.coral:'transparent'}`,cursor:'pointer'}}>
          <div style={{width:32,height:32,borderRadius:8,background:d.bg,display:'grid',placeItems:'center',fontSize:16}}>{d.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700}}>{d.title}</div>
            <div style={{fontSize:10,color:PP.stone}}>{d.meta}</div>
          </div>
          <div style={{fontSize:13,fontWeight:800}}>{d.amt}</div>
        </div>
      ))}
    </div>
    <BottomNav active="home"/>
  </div>
  );
};
window.Home = Home;
