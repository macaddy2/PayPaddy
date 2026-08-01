const Agents = ({ onBack }) => {
  const T = getTheme();
  const agents = [
    {name:'Mama Chika Kiosk',dist:'280m',rate:'4.9★',area:'Computer Village',hours:'Open · closes 8pm',x:'42%',y:'38%'},
    {name:'QuickCash Ikeja',dist:'650m',rate:'4.8★',area:'Allen Ave',hours:'Open · 24/7',x:'68%',y:'55%'},
    {name:'PayPoint Yaba',dist:'1.2km',rate:'4.7★',area:'Herbert Macaulay',hours:'Open · closes 9pm',x:'28%',y:'70%'},
  ];
  const [sel, setSel] = React.useState(0);
  return (
    <div style={{height:'100%',background:PP.cream,color:PP.charcoal,display:'flex',flexDirection:'column'}}>
      <div style={{position:'relative',height:260,background:'linear-gradient(180deg,#e8eae4 0%,#d4d8ce 100%)',overflow:'hidden'}}>
        <div style={{position:'absolute',top:36,left:12,width:34,height:34,background:'#fff',borderRadius:10,display:'grid',placeItems:'center',fontSize:16,boxShadow:'0 2px 8px rgba(0,0,0,.15)',cursor:'pointer',zIndex:3}} onClick={onBack}>←</div>
        {/* Fake map grid */}
        <svg width="100%" height="100%" style={{position:'absolute',opacity:.25}}>
          <defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#8B8680" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
          <path d="M 10 120 Q 80 80, 160 130 T 280 160" stroke="#8B8680" strokeWidth="1.5" fill="none" opacity=".4"/>
          <path d="M 40 40 Q 120 120, 250 80" stroke="#8B8680" strokeWidth="1.5" fill="none" opacity=".4"/>
        </svg>
        {/* You pin */}
        <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:2}}>
          <div style={{width:18,height:18,borderRadius:'50%',background:PP.info,border:'3px solid #fff',boxShadow:'0 0 0 8px rgba(61,127,255,.2)'}}/>
        </div>
        {agents.map((a,i)=>(
          <div key={i} onClick={()=>setSel(i)} style={{position:'absolute',left:a.x,top:a.y,transform:'translate(-50%,-100%)',cursor:'pointer',zIndex:sel===i?3:2}}>
            <div style={{padding:'4px 8px',background:sel===i?PP.ink:'#fff',color:sel===i?T.highlight:PP.ink,borderRadius:8,fontSize:10,fontWeight:800,whiteSpace:'nowrap',boxShadow:'0 2px 6px rgba(0,0,0,.2)',fontVariantNumeric:'tabular-nums'}}>₦ {a.dist}</div>
            <div style={{width:0,height:0,borderLeft:'5px solid transparent',borderRight:'5px solid transparent',borderTop:`6px solid ${sel===i?PP.ink:'#fff'}`,margin:'0 auto'}}/>
          </div>
        ))}
      </div>
      <div style={{padding:'14px 16px 0'}}>
        <h3 style={{fontSize:18,fontWeight:900,letterSpacing:'-.5px'}}>Agents near you</h3>
        <p style={{fontSize:11,color:PP.stone,marginBottom:12}}>Deposit cash, withdraw to PayPaddy, or get help.</p>
      </div>
      <div style={{padding:'0 16px 24px',flex:1,overflow:'auto'}}>
        {agents.map((a,i)=>(
          <div key={i} onClick={()=>setSel(i)} style={{background:'#fff',border:`1.5px solid ${sel===i?T.primary:PP.sand}`,borderRadius:12,padding:14,marginBottom:8,cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${T.primary}15`,display:'grid',placeItems:'center',fontSize:18}}>📍</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
                <div style={{fontSize:13,fontWeight:800,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.name}</div>
                <div style={{fontSize:11,fontWeight:700,color:PP.stone,flexShrink:0}}>{a.dist}</div>
              </div>
              <div style={{fontSize:10,color:PP.stone,marginTop:2}}>{a.area} · {a.rate}</div>
              <div style={{fontSize:10,color:PP.emerald,fontWeight:700,marginTop:2}}>● {a.hours}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
window.Agents = Agents;
