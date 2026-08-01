const Trinity = ({ onBack, onVerify }) => (
  <div style={{height:'100%',background:PP.ink,color:PP.cream,padding:16,display:'flex',flexDirection:'column'}}>
    <div style={{marginTop:24}}>
      <span onClick={onBack} style={{fontSize:18,cursor:'pointer'}}>←</span>
      <div style={{fontSize:10,color:PP.stone,marginTop:14,marginBottom:6}}>Step 2 of 3</div>
      <h3 style={{fontSize:24,fontWeight:900,letterSpacing:'-.8px',lineHeight:1.1}}>One quick<br/>verification left</h3>
      <p style={{fontSize:12,color:PP.stone,marginTop:6,marginBottom:20}}>Add your NIN and we're done.</p>
    </div>
    <div style={{marginBottom:18}}>
      <VerifySegBar steps={['BVN','NIN','FACE']} activeIdx={1}/>
    </div>
    <div style={{background:'rgba(255,255,255,.05)',border:`1.5px solid ${PP.apricot}`,borderRadius:16,padding:16,marginBottom:14}}>
      <Eyebrow color={PP.apricot} style={{marginBottom:12}}>YOUR NIN</Eyebrow>
      <div style={{display:'flex',gap:4,justifyContent:'center'}}>
        {[1,1,1,1,1,2,0,0,0,0,0].map((v,i)=>(
          <div key={i} style={{
            width:22,height:30,borderRadius:4,
            background:v===1?PP.cream:'rgba(255,255,255,.08)',
            border:v===2?`1.5px solid ${PP.apricot}`:'1px solid rgba(255,255,255,.15)',
            display:'grid',placeItems:'center',fontSize:14,fontWeight:700,color:v===1?PP.ink:'transparent'
          }}>•</div>
        ))}
      </div>
      <p style={{fontSize:9,color:PP.stone,textAlign:'center',marginTop:10}}>🔒 Encrypted & stored with NDPR-compliant partner</p>
    </div>
    <div style={{background:'rgba(255,255,255,.04)',borderRadius:10,padding:12,marginBottom:14,display:'flex',gap:10}}>
      <span style={{fontSize:20}}>🛡️</span>
      <div>
        <div style={{fontSize:12,fontWeight:700}}>Why 3 checks?</div>
        <p style={{fontSize:10,color:PP.stone,lineHeight:1.5,marginTop:2}}>BVN confirms your bank. NIN confirms your identity. Face match locks it together — all for your safety.</p>
      </div>
    </div>
    <div style={{marginTop:'auto'}}>
      <PrimaryButton onClick={onVerify}>Verify NIN →</PrimaryButton>
    </div>
  </div>
);
window.Trinity = Trinity;
