const Splash = ({ onNext }) => {
  const T = getTheme();
  return (
    <div style={{height:'100%',background:T.heroBg,position:'relative',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
        <div style={{position:'absolute',width:200,height:200,borderRadius:'50%',background:PP.emerald,filter:'blur(60px)',opacity:.35,top:-40,left:-60}}/>
        <div style={{position:'absolute',width:160,height:160,borderRadius:'50%',background:T.highlight,filter:'blur(60px)',opacity:.2,bottom:60,right:-50}}/>
        <div style={{position:'absolute',width:120,height:120,borderRadius:'50%',background:T.accent,filter:'blur(60px)',opacity:.15,bottom:-20,left:40}}/>
      </div>
      <DotGrid cols={4} rows={5} style={{position:'absolute',top:'45%',right:20,opacity:.25}}/>
      <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:'48px 24px 32px',textAlign:'center'}}>
        <div style={{width:56,height:56,background:T.highlight,borderRadius:14,display:'grid',placeItems:'center',transform:'rotate(-8deg)',fontSize:26,marginBottom:28}}>🔒</div>
        <h1 style={{fontSize:38,fontWeight:900,lineHeight:1.05,letterSpacing:'-1.5px',margin:'0 0 14px',color:PP.cream}}>
          No wahala.<br/><span style={{color:T.highlight}}>Your money</span><br/>is safe.
        </h1>
        <p style={{fontSize:12,color:PP.stone,lineHeight:1.5,maxWidth:220,marginBottom:20}}>
          The trust layer for any deal — commerce, contracts, bets, services.
        </p>
        <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:22,flexWrap:'wrap'}}>
          <TrustPill>✓ CBN Licensed</TrustPill><TrustPill>✓ NDIC Insured</TrustPill><TrustPill>✓ NDPR</TrustPill>
        </div>
        <div style={{width:'100%',maxWidth:220}}>
          <PrimaryButton onClick={onNext} style={{marginBottom:10}}>Create Account</PrimaryButton>
          <span style={{fontSize:12,color:PP.stone,textDecoration:'underline',cursor:'pointer'}}>Sign in</span>
        </div>
      </div>
    </div>
  );
};
window.Splash = Splash;
