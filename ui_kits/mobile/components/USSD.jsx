const USSD = ({ onBack }) => (
  <div style={{height:'100%',background:PP.ink,color:PP.cream,padding:16,overflow:'auto'}}>
    <div style={{marginTop:24,marginBottom:10,display:'flex',alignItems:'center',gap:10}}>
      <span onClick={onBack} style={{fontSize:18,cursor:'pointer'}}>←</span>
      <h3 style={{fontSize:20,fontWeight:900}}>Pay Offline</h3>
    </div>
    <div style={{background:PP.apricot,color:PP.ink,borderRadius:8,padding:10,textAlign:'center',fontSize:13,fontWeight:700,marginBottom:16}}>No data? No wahala. 📱</div>
    <div style={{background:'#fff',color:PP.charcoal,borderRadius:14,padding:16,marginBottom:16}}>
      <div style={{background:PP.ink,borderRadius:8,padding:16,textAlign:'center',marginBottom:10}}>
        <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:26,fontWeight:800,color:PP.lime,letterSpacing:2}}>*999*1*4829#</div>
      </div>
      <button style={{display:'block',margin:'0 auto',padding:'6px 20px',borderRadius:999,background:PP.sand,border:'none',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',color:PP.charcoal}}>📋 Copy Code</button>
      <div style={{textAlign:'center',margin:'10px 0',fontSize:12}}>Expires in <span style={{color:PP.coral,fontWeight:800,fontSize:16}}>04:52</span></div>
    </div>
    {[
      {n:1,t:<><strong>Dial the code</strong> on your phone — no internet needed</>},
      {n:2,t:<><strong>Enter your PIN</strong> when prompted by your bank</>},
      {n:3,t:<><strong>Get SMS confirmation</strong> — deal funded instantly</>}
    ].map(s=>(
      <div key={s.n} style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}>
        <div style={{width:24,height:24,borderRadius:'50%',background:PP.lime,color:PP.ink,display:'grid',placeItems:'center',fontSize:12,fontWeight:800,flexShrink:0}}>{s.n}</div>
        <div style={{fontSize:12,lineHeight:1.5}}>{s.t}</div>
      </div>
    ))}
    <div style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(191,255,79,.15)',borderRadius:14,padding:14,marginTop:8}}>
      <div style={{fontSize:13,fontWeight:700}}>📍 No SIM? Find an Agent</div>
      <p style={{fontSize:11,color:PP.stone,marginTop:2}}>12 PayPaddy agents within 2km of you</p>
    </div>
  </div>
);
window.USSD = USSD;
