const DealRoom = ({ onBack, onConfirm, onDispute }) => (
  <div style={{height:'100%',background:PP.cream,color:PP.charcoal,display:'flex',flexDirection:'column'}}>
    <div style={{padding:'36px 16px 12px',display:'flex',alignItems:'center',gap:10}}>
      <span onClick={onBack} style={{fontSize:18,cursor:'pointer'}}>←</span>
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:800,letterSpacing:'-.3px'}}>MacBook Pro Purchase</div>
        <div style={{fontSize:10,color:PP.stone,fontFamily:'JetBrains Mono, monospace'}}>#PP-4829</div>
      </div>
      <span style={{fontSize:18}}>⋯</span>
    </div>
    <div style={{padding:'0 16px 12px'}}>
      <VaultCard amount="₦1,250,000" bank="with GTBank (CBN Licensed)"/>
    </div>
    <div style={{padding:'0 16px 12px'}}>
      <MilestoneBar steps={['Created','Funded','Delivery','Done']} activeIdx={2}/>
    </div>
    <div style={{margin:'0 16px 10px',padding:10,background:'#fff',borderRadius:8,display:'flex',alignItems:'center',gap:10,border:`1px solid ${PP.sand}`}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:30,height:30,borderRadius:'50%',background:PP.apricot,color:PP.ink,display:'grid',placeItems:'center',fontSize:11,fontWeight:800,margin:'0 auto 2px'}}>AO</div>
        <div style={{fontSize:9,fontWeight:700}}>You</div>
        <div style={{fontSize:8,color:PP.emerald,fontWeight:600}}>Paid</div>
      </div>
      <div style={{flex:1,height:1,background:PP.sand}}/>
      <div style={{fontSize:14}}>🤝</div>
      <div style={{flex:1,height:1,background:PP.sand}}/>
      <div style={{textAlign:'center'}}>
        <div style={{width:30,height:30,borderRadius:'50%',background:PP.forest,color:PP.cream,display:'grid',placeItems:'center',fontSize:11,fontWeight:800,margin:'0 auto 2px'}}>TH</div>
        <div style={{fontSize:9,fontWeight:700}}>TechHub CV</div>
        <div style={{fontSize:8,color:PP.apricot,fontWeight:600}}>Delivering</div>
      </div>
    </div>
    <div style={{padding:'0 16px 8px',flex:1,overflow:'auto'}}>
      <div style={{background:'rgba(0,168,107,.08)',borderRadius:8,padding:'8px 10px',fontSize:11,color:PP.forest,marginBottom:6}}>✓ Funds verified & locked — Apr 15, 09:42</div>
      <div style={{background:'#fff',borderRadius:8,padding:'8px 10px',marginBottom:6,border:`1px solid ${PP.sand}`}}>
        <div style={{fontSize:9,fontWeight:700,color:PP.emerald}}>TechHub CV</div>
        <div style={{fontSize:11,lineHeight:1.5}}>Item shipped via DHL — tracking NGR38291</div>
      </div>
      <div style={{background:'rgba(0,168,107,.08)',borderRadius:8,padding:'8px 10px',fontSize:11,color:PP.forest,marginBottom:6}}>📦 Delivery expected Apr 18</div>
    </div>
    <div style={{display:'flex',gap:6,padding:'10px 16px 14px',background:PP.cream,borderTop:`1px solid ${PP.sand}`}}>
      <EmeraldButton onClick={onConfirm}>✓ I got the item</EmeraldButton>
      <button style={{padding:'10px 14px',borderRadius:8,background:'#fff',border:`1px solid ${PP.sand}`,fontSize:14,cursor:'pointer'}}>💬</button>
      <button onClick={onDispute} style={{padding:10,borderRadius:8,background:'rgba(255,107,74,.1)',color:PP.coral,border:'1px solid rgba(255,107,74,.2)',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>⚠️</button>
    </div>
  </div>
);
window.DealRoom = DealRoom;
