const Onboarding = ({ onContinue }) => {
  const T = getTheme();
  const [step, setStep] = React.useState(0);
  const slides = [
    { icon:'🔒', title:'Lock your money', body:'Funds sit with a CBN-licensed bank until both sides agree.' },
    { icon:'🤝', title:'Any deal, any paddy', body:'Goods, services, contracts, wagers — one trust layer for all.' },
    { icon:'🛡️', title:'Real humans resolve', body:'If things go sideways, a human mediator steps in within 24h.' },
  ];
  const s = slides[step];
  return (
    <div style={{height:'100%',background:T.heroBg,color:PP.cream,display:'flex',flexDirection:'column',padding:'48px 24px 28px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',width:220,height:220,borderRadius:'50%',background:T.accent,filter:'blur(80px)',opacity:.18,top:40,right:-60}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',position:'relative',zIndex:2}}>
        <div style={{display:'flex',gap:6}}>{slides.map((_,i)=>(<div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?T.highlight:'rgba(255,255,255,.2)',transition:'width .3s'}}/>))}</div>
        <span onClick={onContinue} style={{fontSize:12,color:PP.stone,cursor:'pointer'}}>Skip</span>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',position:'relative',zIndex:2}}>
        <div style={{width:72,height:72,background:T.highlight,borderRadius:18,display:'grid',placeItems:'center',fontSize:32,marginBottom:28,transform:'rotate(-6deg)'}}>{s.icon}</div>
        <h2 style={{fontSize:32,fontWeight:900,letterSpacing:'-1px',lineHeight:1.1,marginBottom:12}}>{s.title}</h2>
        <p style={{fontSize:14,color:PP.stone,lineHeight:1.55,maxWidth:260}}>{s.body}</p>
      </div>
      <PrimaryButton onClick={()=> step<2 ? setStep(step+1) : onContinue && onContinue()}>{step<2?'Next':'Get started'}</PrimaryButton>
    </div>
  );
};
window.Onboarding = Onboarding;
