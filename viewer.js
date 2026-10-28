'use strict';
const API='https://gvvrgatpnmxpiqmvyfwa.supabase.co/functions/v1/share-read';
const token=new URLSearchParams(location.search).get('token');
const escapeHtml=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sum=a=>a.reduce((x,y)=>x+y,0),fmt=x=>(x>0?'+':'')+x.toLocaleString('en-US',{maximumFractionDigits:2});
function totals(s){
 const cash=Object.fromEntries(s.players.map(p=>[p.id,0]));
 const side={...cash},reward={...cash};
 for(const e of s.entries||[]){
  (e.playerIds||[]).forEach((id,i)=>{
   if(!(id in cash))return;
   const combinedCash=Number(e.cash?.[i]||0);
   const rewardAmount=(e.rewards||[]).reduce((n,r)=>n+Number(r?.[i]||0),0);
   // Legacy round cash includes reward; independent reward entries store it in cash.
   const r=e.kind==='reward'?combinedCash: e.kind==='round'?rewardAmount:0;
   cash[id]+=combinedCash-r;
   reward[id]+=r;
   side[id]+=Number(e.side?.[i]||0);
  });
 }
 return {cash,side,reward};
}
async function refresh(){const notice=document.getElementById('notice'),viewer=document.getElementById('viewer');if(!token){notice.textContent='網址缺少分享識別碼。';return;}if(!globalThis.V6_SUPABASE_ANON_JWT||!globalThis.V6_SUPABASE_ANON_JWT.startsWith('eyJ')){notice.textContent='尚未設定公開 anon JWT，請通知分享者完成網站設定。';return;}try{
 const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','apikey':globalThis.V6_SUPABASE_ANON_JWT||'','Authorization':'Bearer '+(globalThis.V6_SUPABASE_ANON_JWT||'')},body:JSON.stringify({share_token:token}),cache:'no-store'});
 const data=await res.json();if(!res.ok)throw Error(data.error||'讀取失敗 ('+res.status+')');
 const s=data.ledger_data?.session;if(!s||!Array.isArray(s.players)||!Array.isArray(s.entries))throw Error('分享格式不符，請確認網站與 API 版本。');
 const {cash,side,reward}=totals(s);const rows=s.players.map(p=>{const c=cash[p.id],v=side[p.id],r=reward[p.id],total=c+v+r,money=Math.sign(total)*Math.ceil(Math.abs(total)/2);return `<tr><td>${escapeHtml(p.name)}</td><td>${fmt(c)}</td><td>${fmt(v)}</td><td>${fmt(r)}</td><td>${fmt(total)}</td><td>${fmt(money)}</td></tr>`}).join('');
 const entries=[...s.entries].reverse().map(e=>`<tr><td>${escapeHtml(e.date||'')}</td><td>${escapeHtml(e.kind==='round'?'第 '+e.round+' 局':({mini:'小遊戲',cash:'現金桌',reward:'額外獎勵',between:'局間小遊戲'}[e.kind]||e.kind))}</td><td>${escapeHtml((e.playerIds||[]).length)} 人</td></tr>`).join('');
 viewer.innerHTML=`<section class="panel"><h2>${escapeHtml(s.title)}</h2><p>狀態：${s.status==='closed'?'已結束':'進行中'} · ${s.entries.length} 筆紀錄</p><div class="viewer-table"><table><thead><tr><th>玩家</th><th>現金桌</th><th>小遊戲</th><th>額外獎勵</th><th>總盈虧</th><th>換算金額</th></tr></thead><tbody>${rows}</tbody></table></div></section><section class="panel"><h2>最近紀錄</h2><div class="viewer-table"><table><thead><tr><th>時間</th><th>類型</th><th>人數</th></tr></thead><tbody>${entries}</tbody></table></div></section>`;
 notice.textContent='唯讀 · 版本 '+data.data_version+' · 更新於 '+new Date().toLocaleTimeString('zh-TW');
 }catch(e){notice.textContent='無法讀取：'+e.message;viewer.innerHTML='';}}
document.getElementById('refresh').addEventListener('click',refresh);refresh();setInterval(()=>{if(!document.hidden)refresh()},15000);
