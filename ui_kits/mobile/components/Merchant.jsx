const Merchant = ({ onBack }) => {
  const T = getTheme();
  return (
    <div style={{height:'100%',background:PP.cream,color:PP.charcoal,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:T.headerGrad,padding:'36px 16px 18px',color:PP.cream,borderRadius:'0 0 20px 20px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span onClick={onBack} style={{fontSize:18,cursor:'pointer'}}>←</span>
            <div>
              <div style={{fontSize:11,color:PP.stone}}>Merchant</div>
              <div style={{fontSize:15,fontWeight:800}}>TechHub CV</div>
            </div>
          </div>
          <div style={{padding:'4px 10px',background:'rgba(191,255,79,.15)',color:T.highlight,borderRadius:999,fontSize:10,fontWeight:800}}>✓ VERIFIED</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <div style={{flex:1,background:'rgba(255,255,255,.08)',borderRadius:10,padding:'10px 12px'}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,.6)',fontWeight:700,letterSpacing:'.5px'}}>TODAY</div>
            <div style={{fontSize:18,fontWeight:900,fontVariantNumeric:'tabular-nums'}}>₦3.4M</div>
          </div>
          <div style={{flex:1,background:'rgba(255,255,255,.08)',borderRadius:10,padding:'10px 12px'}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,.6)',fontWeight:700,letterSpacing:'.5px'}}>IN ESCROW</div>
            <div style={{fontSize:18,fontWeight:900,fontVariantNumeric:'tabular-nums'}}>₦8.9M</div>
          </div>
          <div style={{flex:1,background:'rgba(255,255,255,.08)',borderRadius:10,padding:'10px 12px'}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,.6)',fontWeight:700,letterSpacing:'.5px'}}>DISPUTES</div>
            <div style={{fontSize:18,fontWeight:900,color:T.highlight}}>0</div>
          </div>
        </div>
      </div>
      <div style={{padding:'14px 16px',flex:1,overflow:'auto'}}>
        <Eyebrow style={{marginBottom:10}}>Pending Release · 3</Eyebrow>
        {[
          {buyer:'Ade O.',item:'MacBook Pro M3',amt:'₦1.25M',state:'Delivered — awaiting confirm',pct:75,tone:T.accent},
          {buyer:'Ngozi K.',item:'iPhone 15 Pro',amt:'₦950K',state:'Funded — ship today',pct:40,tone:PP.info},
          {buyer:'Tunde A.',item:'Gaming PC build',amt:'₦2.1M',state:'Milestone 2/3',pct:60,tone:T.highlight},
        ].map((r,i)=>(
          <div key={i} style={{background:'#fff',border:`1px solid ${PP.sand}`,borderRadius:12,padding:12,marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <div>
                <div style={{fontSize:13,fontWeight:700}}>{r.item}</div>
                <div style={{fontSize:10,color:PP.stone}}>{r.buyer}</div>
              </div>
              <div style={{fontSize:14,fontWeight:800,fontVariantNumeric:'tabular-nums'}}>{r.amt}</div>
            </div>
            <div style={{height:4,background:PP.sand,borderRadius:2,overflow:'hidden',marginTop:8,marginBottom:4}}>
              <div style={{height:'100%',width:`${r.pct}%`,background:r.tone,borderRadius:2}}/>
            </div>
            <div style={{fontSize:10,color:PP.stone,fontWeight:600}}>{r.state}</div>
          </div>
        ))}
        <Eyebrow style={{marginTop:16,marginBottom:10}}>Payouts this week</Eyebrow>
        <div style={{background:'#fff',border:`1px solid ${PP.sand}`,borderRadius:12,padding:14,display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:40,height:40,borderRadius:10,background:`${PP.emerald}20`,display:'grid',placeItems:'center',fontSize:18}}>💸</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700}}>Next payout — Friday</div>
            <div style={{fontSize:10,color:PP.stone}}>To GTBank ····4829 · T+1 settlement</div>
          </div>
          <div style={{fontSize:14,fontWeight:800,color:PP.emerald,fontVariantNumeric:'tabular-nums'}}>₦2.2M</div>
        </div>
      </div>
    </div>
  );
};
window.Merchant = Merchant;
