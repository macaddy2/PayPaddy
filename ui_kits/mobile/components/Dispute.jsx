const Dispute = ({ onBack, onSubmit }) => {
  const [sel, setSel] = React.useState(null);
  const [note, setNote] = React.useState('');
  const issues = [
    {icon:'📦', label:'Never arrived',       hint:'Item or service never delivered'},
    {icon:'❓', label:'Not as described',    hint:'Different from what was agreed'},
    {icon:'🧩', label:'Incomplete',          hint:'Only part of the order arrived'},
    {icon:'🔇', label:'Seller unresponsive', hint:'Radio silence for 48h+'},
    {icon:'✏️', label:'Something else',      hint:'Tell us in your own words'},
  ];
  return (
    <div style={{height:'100%',background:PP.cream,color:PP.charcoal,display:'flex',flexDirection:'column'}}>
      {/* Forest hero — calm, on-brand. Vault FIRST because that's the actual message. */}
      <div style={{background:PP.forest,color:PP.cream,padding:'36px 16px 22px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:PP.emerald,opacity:.18,filter:'blur(20px)'}}/>
        <div style={{position:'relative'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <span onClick={onBack} style={{fontSize:18,cursor:'pointer'}}>←</span>
            <span style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.8)'}}>Raise a Dispute</span>
            <span style={{marginLeft:'auto',fontFamily:'JetBrains Mono, monospace',fontSize:10,color:'rgba(255,255,255,.5)'}}>#PP-4829</span>
          </div>

          {/* Reassurance-forward headline */}
          <h3 style={{fontSize:22,fontWeight:900,letterSpacing:'-.6px',lineHeight:1.15,margin:0}}>
            Money no go waka.<br/>
            <span style={{color:PP.lime}}>Your ₦1,250,000 is safe.</span>
          </h3>

          {/* Inline reassurance row — replaces the old red bar */}
          <div style={{display:'flex',gap:14,marginTop:14,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:PP.emerald}}/>
              <span style={{fontSize:11,color:'rgba(255,255,255,.85)'}}>Funds frozen</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:PP.apricot}}/>
              <span style={{fontSize:11,color:'rgba(255,255,255,.85)'}}>24h avg. resolution</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:PP.lime}}/>
              <span style={{fontSize:11,color:'rgba(255,255,255,.85)'}}>Reviewed by a human</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll area */}
      <div style={{padding:'16px 16px 24px',flex:1,overflow:'auto'}}>
        {/* Counterparty card — gives the dispute context */}
        <div style={{background:'#fff',borderRadius:12,padding:12,marginBottom:18,display:'flex',alignItems:'center',gap:10,border:`1px solid ${PP.sand}`}}>
          <div style={{width:36,height:36,borderRadius:10,background:'rgba(0,168,107,.1)',display:'grid',placeItems:'center',fontSize:18}}>📦</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:800}}>MacBook Pro M3</div>
            <div style={{fontSize:10,color:PP.stone}}>with TechHub CV · funded Apr 15</div>
          </div>
          <div style={{fontSize:13,fontWeight:800,fontVariantNumeric:'tabular-nums'}}>₦1.25M</div>
        </div>

        <Eyebrow style={{marginBottom:10}}>What happened? · Step 1 of 3</Eyebrow>
        <ul style={{listStyle:'none',margin:0,padding:0}}>
          {issues.map((t,i)=>{
            const active = sel===i;
            return (
              <li key={i} onClick={()=>setSel(i)} style={{
                background:active?PP.ink:'#fff',
                color:active?PP.cream:PP.charcoal,
                borderRadius:12,padding:'12px 14px',marginBottom:8,fontSize:13,fontWeight:700,
                border:`1.5px solid ${active?PP.ink:PP.sand}`,
                display:'flex',alignItems:'center',gap:12,cursor:'pointer',
                transition:'all .15s'
              }}>
                <span style={{
                  width:32,height:32,borderRadius:10,flexShrink:0,
                  background:active?'rgba(191,255,79,.15)':'rgba(0,168,107,.08)',
                  display:'grid',placeItems:'center',fontSize:16
                }}>{t.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:800}}>{t.label}</div>
                  <div style={{fontSize:10,color:active?'rgba(250,247,242,.6)':PP.stone,fontWeight:500,marginTop:1}}>{t.hint}</div>
                </div>
                <span style={{
                  width:20,height:20,borderRadius:'50%',flexShrink:0,
                  border:`1.5px solid ${active?PP.lime:PP.sand}`,
                  background:active?PP.lime:'transparent',
                  display:'grid',placeItems:'center',fontSize:11,fontWeight:900,color:PP.ink
                }}>{active?'✓':''}</span>
              </li>
            );
          })}
        </ul>

        {/* Expands when something is selected */}
        {sel!==null && (
          <>
            <Eyebrow style={{marginTop:18,marginBottom:8}}>Tell us more (optional)</Eyebrow>
            <textarea
              value={note}
              onChange={e=>setNote(e.target.value)}
              placeholder="Give us the full gist — dates, conversations, anything that helps our team resolve this faster."
              style={{
                width:'100%',minHeight:84,padding:12,borderRadius:12,
                border:`1.5px solid ${PP.sand}`,background:'#fff',
                fontFamily:'inherit',fontSize:12,lineHeight:1.5,color:PP.charcoal,
                resize:'vertical',outline:'none',boxSizing:'border-box'
              }}
            />

            <Eyebrow style={{marginTop:18,marginBottom:8}}>Add evidence · helps a lot</Eyebrow>
            <div style={{display:'flex',gap:8,marginBottom:4}}>
              {['📷','🎥','📄'].map((ic,i)=>(
                <div key={i} style={{
                  flex:1,aspectRatio:'1',border:`2px dashed ${PP.sand}`,borderRadius:12,
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  gap:4,cursor:'pointer',background:'#fff'
                }}>
                  <span style={{fontSize:20,opacity:.7}}>{ic}</span>
                  <span style={{fontSize:9,fontWeight:700,color:PP.stone}}>
                    {['Photo','Video','Doc'][i]}
                  </span>
                </div>
              ))}
            </div>
            <div style={{fontSize:10,color:PP.stone,marginTop:6}}>Screenshots of chats, receipts, delivery photos — anything.</div>
          </>
        )}
      </div>

      {/* Sticky footer — clear hierarchy, no alarm red */}
      <div style={{padding:'12px 16px 16px',background:PP.cream,borderTop:`1px solid ${PP.sand}`}}>
        <button
          onClick={onSubmit}
          disabled={sel===null}
          style={{
            width:'100%',padding:14,borderRadius:14,
            background:sel===null?PP.sand:PP.ink,
            color:sel===null?PP.stone:PP.cream,
            fontSize:14,fontWeight:800,border:'none',
            cursor:sel===null?'not-allowed':'pointer',
            fontFamily:'inherit',marginBottom:8,
            display:'flex',alignItems:'center',justifyContent:'center',gap:8
          }}
        >
          {sel===null ? 'Select an issue to continue' : <>Open Dispute <span style={{color:PP.lime}}>→</span></>}
        </button>
        <p style={{fontSize:10,color:PP.stone,textAlign:'center',margin:0,lineHeight:1.5}}>
          A real paddy (not a bot) reviews every case. Most get resolved in under a day.
        </p>
      </div>
    </div>
  );
};
window.Dispute = Dispute;
